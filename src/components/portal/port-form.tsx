"use client";
import React, { useEffect } from "react";
import {
  Controller,
  ControllerRenderProps,
  DefaultValues,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Port, PortFormProps } from "@/lib/portal/types";
import { useAddPortMutation } from "@/lib/portal/features/ports/portsApiSlice";
import { useUpdatePortMutation } from "@/lib/portal/features/ports/portsApiSlice";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { HEX_COLOR, MAX_PORT_CAPACITY } from "@/lib/schemas/port";
import { PortMapPreview } from "./port-map-preview";
import { createCurvePath } from "@/lib/map/polylinesCurves";
import type { LatLngLiteral } from "leaflet";

/**
 * A form number from an input or the API, which returns decimal columns as
 * strings. Blank becomes undefined rather than NaN, so it is left out of the
 * request instead of being sent as null.
 */
function toNumber(value: number | string | null | undefined) {
  return value === null || value === undefined || value === ""
    ? undefined
    : Number(value);
}

/** A port's position; the API returns decimal columns as strings. */
const toLatLng = (port: Pick<Port, "lat" | "lng">) => ({
  lat: Number(port.lat),
  lng: Number(port.lng),
});

/** Validation rules for a coordinate, matching the API's limits. */
function coordinateRules(label: string, limit: number) {
  const message = `${label} must be between -${limit} and ${limit}`;
  return {
    setValueAs: toNumber,
    required: `${label} is required`,
    min: { value: -limit, message },
    max: { value: limit, message },
  };
}

/** The form's values for the port being edited, or a blank `portType` port. */
function toFormValues(
  port: Port | null | undefined,
  portType: PortFormProps["portType"]
): DefaultValues<Port> {
  if (!port) {
    return {
      port_location_type: portType || "",
      name: "",
      country: portType === "Indian" ? "India" : "",
      city: "",
      number_of_berths: undefined,
      port_type: "",
      average_tat: undefined,
      port_capacity: undefined,
      dominant_cargo: "",
      lat: undefined,
      lng: undefined,
      status: "Active",
      ind_port_name: "",
      ind_port_lat: undefined,
      ind_port_lng: undefined,
      // A gentle northward bow, adjusted with the route curve slider.
      polyline_curve: portType === "Other" ? 20 : undefined,
      polyline_color: undefined,
    };
  }

  return {
    // Go by country, as the ports page does: older rows saved the wrong type.
    port_location_type:
      port.country?.toLowerCase() === "india" ? "Indian" : "Other",
    name: port.name || "",
    country: port.country || "",
    city: port.city || "",
    number_of_berths: toNumber(port.number_of_berths),
    port_type: port.port_type || "",
    average_tat: toNumber(port.average_tat),
    port_capacity: toNumber(port.port_capacity),
    dominant_cargo: port.dominant_cargo || "",
    lat: toNumber(port.lat),
    lng: toNumber(port.lng),
    status:
      port.status === "Active" || port.status === "Inactive"
        ? port.status
        : "Active",
    ind_port_name: port.ind_port_name || "",
    ind_port_lat: toNumber(port.ind_port_lat),
    ind_port_lng: toNumber(port.ind_port_lng),
    polyline_curve: toNumber(port.polyline_curve),
    polyline_color: port.polyline_color || undefined,
  };
}

export function PortForm({
  isOpen,
  onClose,
  portType,
  indianPorts = [],
  partnerPorts = [],
  editingPort,
}: PortFormProps) {
  const [addPort, { isLoading: isAddingPort }] = useAddPortMutation();
  const [updatePort, { isLoading: isUpdatingPort }] = useUpdatePortMutation();

  const isLoading = isAddingPort || isUpdatingPort;

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<Port>({
    defaultValues: toFormValues(editingPort, portType),
  });

  const [
    watchedPortLocationType,
    watchedIndianPortName,
    watchedPolylineColor,
    watchedLat,
    watchedLng,
    watchedCurve,
  ] = useWatch({
    control,
    name: [
      "port_location_type",
      "ind_port_name",
      "polyline_color",
      "lat",
      "lng",
      "polyline_curve",
    ],
  });

  const selectedIndianPort = indianPorts.find(
    (port) => port.name === watchedIndianPortName
  );

  // Only coordinates that pass validation are shown on the map.
  const position =
    Math.abs(watchedLat) <= 90 && Math.abs(watchedLng) <= 180
      ? { lat: watchedLat, lng: watchedLng }
      : undefined;

  // The route lines the map will draw: a hub's to each of its partners, or a
  // partner's from its hub, in the hub's colour.
  const isHubForm = watchedPortLocationType === "Indian";
  const hubColor = isHubForm
    ? watchedPolylineColor
    : selectedIndianPort?.polyline_color;
  // Ignore a colour that is still being typed.
  const previewColor =
    hubColor && HEX_COLOR.test(hubColor) ? hubColor : undefined;
  const routes = !position
    ? []
    : isHubForm
      ? partnerPorts.map((partner) => ({
          key: partner.name,
          path: createCurvePath(
            position,
            toLatLng(partner),
            Number(partner.polyline_curve ?? 0)
          ),
          color: previewColor ?? "",
        }))
      : selectedIndianPort
        ? [
            {
              key: selectedIndianPort.name,
              path: createCurvePath(
                toLatLng(selectedIndianPort),
                position,
                watchedCurve ?? 0
              ),
              color: previewColor ?? "",
            },
          ]
        : [];

  // Open the map on the saved port and its saved route lines. Form values
  // are still being reset when the map first renders, so use the saved port.
  const savedHub = indianPorts.find(
    (port) => port.name === editingPort?.ind_port_name
  );
  const initialView = !editingPort
    ? []
    : editingPort.ind_port_name
      ? savedHub
        ? createCurvePath(
            toLatLng(savedHub),
            toLatLng(editingPort),
            Number(editingPort.polyline_curve ?? 0)
          )
        : [toLatLng(editingPort)]
      : [
          toLatLng(editingPort),
          ...partnerPorts.flatMap((partner) =>
            createCurvePath(
              toLatLng(editingPort),
              toLatLng(partner),
              Number(partner.polyline_curve ?? 0)
            )
          ),
        ];

  const handlePositionChange = ({ lat, lng }: LatLngLiteral) => {
    const options = { shouldDirty: true, shouldValidate: true };
    setValue("lat", lat, options);
    setValue("lng", lng, options);
  };

  // Start from the saved port, or a blank form, every time the dialog opens.
  // Refetches of the port list while it is open must not wipe the user's edits.
  useEffect(() => {
    if (isOpen) reset(toFormValues(editingPort, portType));
  }, [isOpen, editingPort, portType, reset]);

  const getDialogTitle = () => {
    if (editingPort) {
      return `Edit ${
        watchedPortLocationType === "Indian" ? "Indian" : "Other"
      } Port`;
    }
    return `Add ${
      watchedPortLocationType === "Indian" ? "Indian" : "Other"
    } Port`;
  };

  const handleFormSubmit = async (formData: Port) => {
    const editingPortId = editingPort?.port_id;
    // Partner ports keep a copy of their Indian port's coordinates; save its current ones.
    const data = selectedIndianPort
      ? {
          ...formData,
          ind_port_lat: toNumber(selectedIndianPort.lat),
          ind_port_lng: toNumber(selectedIndianPort.lng),
        }
      : formData;

    try {
      if (editingPort && editingPortId) {
        await updatePort({ port_id: editingPortId, data }).unwrap();
        toast.success(`Port ${editingPort.name} updated successfully.`);
      } else {
        await addPort(data).unwrap();
        toast.success(`Port ${data.name} added successfully.`);
      }
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to ${editingPortId ? "update" : "add"} port. Please try again.`
        )
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[900px] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-background to-muted'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold tracking-tight sm:text-2xl'>
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {editingPort
              ? "Update the port information below."
              : `Enter new ${
                  watchedPortLocationType === "Indian" ? "Indian" : "other"
                } port details below.`}
          </DialogDescription>
        </DialogHeader>

        <Card className='border-none shadow-none bg-transparent'>
          <CardContent className='p-0 pt-6'>
            <form
              className='grid gap-6'
              onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Section 1: Core Information */}
              <section className='grid md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Port Name *</Label>
                  <Input
                    id='name'
                    maxLength={100}
                    {...register("name", {
                      required: "Port Name is required",
                    })}
                    placeholder='E.g., Port of Singapore'
                  />
                  {errors.name && (
                    <p className='text-sm text-destructive'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='country'>Country *</Label>
                  <Input
                    id='country'
                    maxLength={100}
                    {...register("country", {
                      required: "Country is required",
                    })}
                    placeholder='E.g., Singapore'
                    disabled={watchedPortLocationType === "Indian"}
                  />
                  {errors.country && (
                    <p className='text-sm text-destructive'>
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='city'>City *</Label>
                  <Input
                    id='city'
                    maxLength={100}
                    {...register("city", {
                      required: "City is required",
                    })}
                    placeholder='E.g., Singapore City'
                  />
                  {errors.city && (
                    <p className='text-sm text-destructive'>
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>Status *</Label>
                  <Controller
                    control={control}
                    name='status'
                    rules={{ required: "Status is required" }}
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<Port, "status">;
                    }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "Active"}
                        defaultValue={field.value || "Active"}>
                        <SelectTrigger id='status'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Active'>Active</SelectItem>
                          <SelectItem value='Inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className='text-sm text-destructive'>
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </section>

              <Separator />

              {/* Section 2: Location and route */}
              <section>
                <h3 className='text-lg font-medium mb-1'>Location and route</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Click the map or drag the pin to place the port, or type its
                  coordinates. The preview shows the port&apos;s route lines as
                  they will appear on the map.
                </p>
                <div className='grid gap-6 md:grid-cols-[1fr_2fr]'>
                  <div className='space-y-4'>
                    {watchedPortLocationType === "Other" && (
                      <div className='space-y-2'>
                        <Label htmlFor='ind_port_name'>
                          Connecting Indian Port *
                        </Label>
                        <Controller
                          control={control}
                          name='ind_port_name'
                          rules={{
                            required: "Connecting Indian Port is required",
                          }}
                          render={({
                            field,
                          }: {
                            field: ControllerRenderProps<Port, "ind_port_name">;
                          }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              defaultValue={field.value || ""}>
                              <SelectTrigger
                                id='ind_port_name'
                                className='w-full'>
                                <SelectValue placeholder='Select an Indian Port' />
                              </SelectTrigger>
                              <SelectContent>
                                {indianPorts.length === 0 && (
                                  <SelectItem
                                    value='loading'
                                    disabled>
                                    Loading Indian ports...
                                  </SelectItem>
                                )}
                                {indianPorts.map((port) => (
                                  <SelectItem
                                    key={port.port_id}
                                    value={port.name}>
                                    {port.name} ({port.city})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.ind_port_name && (
                          <p className='text-sm text-destructive'>
                            {errors.ind_port_name.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className='space-y-2'>
                      <Label htmlFor='lat'>Latitude *</Label>
                      <Input
                        id='lat'
                        type='number'
                        step='any'
                        {...register("lat", coordinateRules("Latitude", 90))}
                        placeholder='E.g., 1.290270'
                      />
                      {errors.lat && (
                        <p className='text-sm text-destructive'>
                          {errors.lat.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='lng'>Longitude *</Label>
                      <Input
                        id='lng'
                        type='number'
                        step='any'
                        {...register("lng", coordinateRules("Longitude", 180))}
                        placeholder='E.g., 103.851959'
                      />
                      {errors.lng && (
                        <p className='text-sm text-destructive'>
                          {errors.lng.message}
                        </p>
                      )}
                    </div>

                    {watchedPortLocationType === "Indian" && (
                      <div className='space-y-2'>
                        <Label htmlFor='polyline_color'>
                          Route colour *
                        </Label>
                        <div className='flex items-center space-x-3'>
                          <Input
                            id='polyline_color'
                            {...register("polyline_color", {
                              required: "Route colour is required",
                              pattern: {
                                value: HEX_COLOR,
                                message: "Use a hex colour such as #ff0000",
                              },
                            })}
                            placeholder='#FF0000'
                            className='flex-grow'
                          />
                          <Input
                            type='color'
                            aria-label='Pick route colour'
                            onChange={(e) =>
                              setValue("polyline_color", e.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            value={watchedPolylineColor || "#007aff"}
                            className='h-10 w-12 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent'
                            style={{
                              backgroundColor: watchedPolylineColor || "#007aff",
                            }}
                          />
                        </div>
                        {errors.polyline_color && (
                          <p className='text-sm text-destructive'>
                            {errors.polyline_color.message}
                          </p>
                        )}
                      </div>
                    )}
                    {watchedPortLocationType === "Other" && (
                      <div className='space-y-2'>
                        <div className='flex items-baseline justify-between'>
                          <Label htmlFor='polyline_curve'>Route curve *</Label>
                          <output
                            htmlFor='polyline_curve'
                            className='text-sm tabular-nums text-muted-foreground'>
                            {watchedCurve ?? 0}°
                          </output>
                        </div>
                        <input
                          id='polyline_curve'
                          type='range'
                          min={-90}
                          max={90}
                          step={1}
                          aria-describedby='polyline_curve-hint'
                          {...register("polyline_curve", {
                            setValueAs: toNumber,
                            required: "Route curve is required",
                          })}
                          className='w-full accent-indigo-600'
                        />
                        <p
                          id='polyline_curve-hint'
                          className='text-xs text-muted-foreground'>
                          How far the line bows north (positive) or south
                          (negative) of a straight route, in degrees.
                        </p>
                        {errors.polyline_curve && (
                          <p className='text-sm text-destructive'>
                            {errors.polyline_curve.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <PortMapPreview
                    position={position}
                    onPositionChange={handlePositionChange}
                    initialView={initialView}
                    routes={routes}
                    color={previewColor}
                  />
                </div>
              </section>

              <Separator />

              {/* Section 3: Optional Information */}
              <section>
                <h3 className='text-lg font-medium mb-1'>
                  Optional Port Details
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Provide additional details about the port&apos;s operations and
                  capacity.
                </p>
                <div className='grid md:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='number_of_berths'>Number of Berths</Label>
                    <Input
                      id='number_of_berths'
                      type='number'
                      step='1'
                      min='0'
                      {...register("number_of_berths", {
                        setValueAs: toNumber,
                        // required: "Number of Berths is required", // Make optional
                      })}
                      placeholder='E.g., 10'
                    />
                    {errors.number_of_berths && (
                      <p className='text-sm text-destructive'>
                        {errors.number_of_berths.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='port_type'>Port Type</Label>
                    <Input
                      id='port_type'
                      maxLength={100}
                      {...register("port_type", {
                        // required: "Port Type is required", // Make optional
                      })}
                      placeholder='E.g., Container, Bulk'
                    />
                    {errors.port_type && (
                      <p className='text-sm text-destructive'>
                        {errors.port_type.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='average_tat'>Average TAT (Days)</Label>
                    <Input
                      id='average_tat'
                      type='number'
                      step='1'
                      min='0'
                      {...register("average_tat", {
                        setValueAs: toNumber,
                        // required: "Average TAT is required", // Make optional
                      })}
                      placeholder='E.g., 2'
                    />
                    {errors.average_tat && (
                      <p className='text-sm text-destructive'>
                        {errors.average_tat.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='port_capacity'>
                      Port Capacity (Million TEU/Year)
                    </Label>
                    <Input
                      id='port_capacity'
                      type='number'
                      step='0.01'
                      min='0'
                      {...register("port_capacity", {
                        setValueAs: toNumber,
                        max: {
                          value: MAX_PORT_CAPACITY,
                          message: "Enter the capacity in million TEU, e.g. 8.5",
                        },
                        // required: "Port Capacity is required", // Make optional
                      })}
                      placeholder='E.g., 8.5'
                    />
                    {errors.port_capacity && (
                      <p className='text-sm text-destructive'>
                        {errors.port_capacity.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dominant_cargo'>Dominant Cargo</Label>
                    <Input
                      id='dominant_cargo'
                      maxLength={200}
                      {...register("dominant_cargo", {
                        // required: "Dominant Cargo is required", // Make optional
                      })}
                      placeholder='E.g., Electronics, Grain'
                    />
                    {errors.dominant_cargo && (
                      <p className='text-sm text-destructive'>
                        {errors.dominant_cargo.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <CardFooter className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className={
                    watchedPortLocationType === "Indian"
                      ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white"
                  }>
                  {isLoading
                    ? "Saving..."
                    : editingPort
                    ? "Update Port"
                    : "Create Port"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
