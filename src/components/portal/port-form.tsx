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
      polyline_curve: undefined,
      polyline_color: undefined,
      zoom: undefined,
      zoom_center_lat: undefined,
      zoom_center_lng: undefined,
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
    zoom: toNumber(port.zoom),
    zoom_center_lat: toNumber(port.zoom_center_lat),
    zoom_center_lng: toNumber(port.zoom_center_lng),
  };
}

export function PortForm({
  isOpen,
  onClose,
  portType,
  indianPorts = [],
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

  const [watchedPortLocationType, watchedIndianPortName, watchedPolylineColor] =
    useWatch({
      control,
      name: ["port_location_type", "ind_port_name", "polyline_color"],
    });

  const selectedIndianPort = indianPorts.find(
    (port) => port.name === watchedIndianPortName
  );

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
      <DialogContent className='sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-br from-background to-muted'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold tracking-tight'>
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

              {/* Section 2: Geographical Coordinates */}
              <section>
                <h3 className='text-lg font-medium mb-4'>
                  Geographical Coordinates
                </h3>
                <div className='grid md:grid-cols-2 gap-6'>
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

              <Separator />

              {/* Section 4: Conditional Fields */}
              {watchedPortLocationType === "Indian" && (
                <section className='p-6 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'>
                  <h3 className='text-lg font-medium text-emerald-800 dark:text-emerald-300 mb-2'>
                    Indian Port Map Settings
                  </h3>
                  <p className='text-sm text-emerald-700 dark:text-emerald-400 mb-4'>
                    Configure map display settings for connections originating
                    from this Indian port.
                  </p>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* Zoom Center Lat/Lng - Removed as likely derived or less critical for initial setup */}
                    <div className='space-y-2'>
                      <Label htmlFor='zoom_center_lat'>
                        Zoom Center Latitude *
                      </Label>
                      <Input
                        id='zoom_center_lat'
                        type='number'
                        step='any'
                        {...register(
                          "zoom_center_lat",
                          coordinateRules("Zoom Center Latitude", 90)
                        )}
                        placeholder='Enter zoom center latitude'
                      />
                      {errors.zoom_center_lat && (
                        <p className='text-sm text-destructive'>
                          {errors.zoom_center_lat.message}
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='zoom_center_lng'>
                        Zoom Center Longitude *
                      </Label>
                      <Input
                        id='zoom_center_lng'
                        type='number'
                        step='any'
                        {...register(
                          "zoom_center_lng",
                          coordinateRules("Zoom Center Longitude", 180)
                        )}
                        placeholder='Enter zoom center longitude'
                      />
                      {errors.zoom_center_lng && (
                        <p className='text-sm text-destructive'>
                          {errors.zoom_center_lng.message}
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='zoom'>Default Map Zoom *</Label>
                      <Input
                        id='zoom'
                        type='number'
                        step='1'
                        min='1'
                        max='20'
                        {...register("zoom", {
                          setValueAs: toNumber,
                          required: "Default Zoom is required",
                        })}
                        placeholder='E.g., 5'
                      />
                      {errors.zoom && (
                        <p className='text-sm text-destructive'>
                          {errors.zoom.message}
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='polyline_color'>
                        Connection Line Color *
                      </Label>
                      <div className='flex items-center space-x-3'>
                        <Input
                          id='polyline_color'
                          {...register("polyline_color", {
                            required: "Polyline Color is required",
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
                          aria-label='Pick connection line color'
                          onChange={(e) =>
                            setValue("polyline_color", e.target.value, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          value={watchedPolylineColor || "#007aff"} // Default color
                          className='h-10 w-12 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent'
                          style={{
                            backgroundColor: watchedPolylineColor || "#007aff",
                          }} // Show selected color
                        />
                      </div>
                      {errors.polyline_color && (
                        <p className='text-sm text-destructive'>
                          {errors.polyline_color.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {watchedPortLocationType === "Other" && (
                <section className='p-6 rounded-lg border bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'>
                  <h3 className='text-lg font-medium text-indigo-800 dark:text-indigo-300 mb-2'>
                    Connect to Indian Port
                  </h3>
                  <p className='text-sm text-indigo-700 dark:text-indigo-400 mb-4'>
                    Select the Indian port this location connects to for mapping
                    purposes.
                  </p>
                  <div className='grid md:grid-cols-2 gap-6'>
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

                    <div className='space-y-2'>
                      <Label htmlFor='polyline_curve'>
                        Map Line Curve Factor *
                      </Label>
                      <Input
                        id='polyline_curve'
                        type='number'
                        step='1'
                        min='-90'
                        max='90'
                        {...register("polyline_curve", {
                          setValueAs: toNumber,
                          required: "Polyline Curve factor is required",
                        })}
                        placeholder='E.g., 20 (degrees the line bows out)'
                      />
                      {errors.polyline_curve && (
                        <p className='text-sm text-destructive'>
                          {errors.polyline_curve.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedIndianPort && (
                    <div className='mt-4 p-3 bg-background rounded-md border border-indigo-200 dark:border-indigo-800 shadow-sm'>
                      <p className='text-sm font-medium text-indigo-700 dark:text-indigo-400'>
                        Selected Indian Port Details:
                      </p>
                      <div className='grid grid-cols-2 gap-2 mt-1 text-sm'>
                        <p>
                          <span className='text-muted-foreground'>Lat:</span>{" "}
                          {selectedIndianPort.lat}
                        </p>
                        <p>
                          <span className='text-muted-foreground'>Lng:</span>{" "}
                          {selectedIndianPort.lng}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hidden fields for lat/lng are not needed if selectedIndianPort is used */}
                </section>
              )}
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
