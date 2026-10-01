"use client";
import React, { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { Upload } from "lucide-react";
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
import { useGetS3FileQuery } from "@/lib/portal/features/s3/s3-files-Api";
import Image from "next/image";
import { Port, PortFormProps } from "@/lib/portal/types";
import { useAddPortMutation } from "@/lib/portal/features/ports/portsApiSlice";
import { useUpdatePortMutation } from "@/lib/portal/features/ports/portsApiSlice";
import { toast } from "sonner";
import { useDeleteFileUrlMutation } from "@/lib/portal/features/s3/s3-files-Api";
import useUploadFileToS3 from "@/hooks/useUploadFileToS3";
import { getApiErrorMessage } from "@/lib/portal/api-errors";

export function PortForm({
  isOpen,
  onClose,
  portType,
  indianPorts = [],
  editingPort,
}: PortFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFlagFile, setSelectedFlagFile] = useState<File | null>(null);
  const [flagPreviewUrl, setFlagPreviewUrl] = useState<string | null>(null);
  const [selectedIndianPort, setSelectedIndianPort] = useState<Port | null>(
    null
  );

  const [addPort, { isLoading: isAddingPort }] = useAddPortMutation();
  const [updatePort, { isLoading: isUpdatingPort }] = useUpdatePortMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileToS3();
  const [deleteFileUrl] = useDeleteFileUrlMutation();

  const isLoading = isAddingPort || isUpdatingPort || isUploading;

  const { data: imageData } = useGetS3FileQuery(
    {
      fileName: editingPort?.image_s3_name,
      fileType: "image/png",
    },
    {
      skip: !editingPort,
    }
  );
  const { data: flagData } = useGetS3FileQuery(
    {
      fileName: editingPort?.flag_s3_name,
      fileType: "image/png",
    },
    {
      skip: !editingPort,
    }
  );

  const defaultValues = {
    portLocationType: portType || "",
    name: "",
    country: portType === "Indian" ? "India" : "",
    city: "",
    image: null,
    flag: null,
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

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
    setError,
  } = useForm<Port>({
    defaultValues,
  });

  const watchedPortLocationType = watch("portLocationType");
  const watchedIndianPortName = watch("ind_port_name");
  const watchedLat = watch("ind_port_lat");
  const watchedLng = watch("ind_port_lng");

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue("image", file);
    }
  };

  // Clear port image selection
  const clearPortImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValue("image", null);
  };

  // Handle flag image file selection
  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFlagFile(file);
      const url = URL.createObjectURL(file);
      setFlagPreviewUrl(url);
      setValue("flag", file);
    }
  };

  // Clear flag image selection
  const clearFlagImage = () => {
    setSelectedFlagFile(null);
    if (flagPreviewUrl) {
      URL.revokeObjectURL(flagPreviewUrl);
    }
    setFlagPreviewUrl(null);
    setValue("flag", null);
  };

  // Update fields when an Indian port is selected in the dropdown
  useEffect(() => {
    if (watchedIndianPortName && portType === "Other") {
      const selectedPort = indianPorts.find(
        (p) => p.name === watchedIndianPortName
      );
      if (selectedPort) {
        setSelectedIndianPort(selectedPort);
        setValue("ind_port_lat", selectedPort.lat);
        setValue("ind_port_lng", selectedPort.lng);
      }
    }
  }, [watchedIndianPortName, indianPorts, portType]);

  // Set portLocationType and country based on portType prop
  useEffect(() => {
    if (portType) {
      setValue("portLocationType", portType);
      if (portType === "Indian") {
        setValue("country", "India");
      }
    }
  }, [portType]);

  // Handle editingPort when editing
  useEffect(() => {
    if (editingPort) {
      // Determine initial portLocationType based on country
      const initialPortLocationType =
        editingPort.country?.toLowerCase() === "india" ? "Indian" : "Other";

      // First reset the form with the basic data
      reset({
        portLocationType: initialPortLocationType,
        name: editingPort.name || "",
        country: editingPort.country || "",
        city: editingPort.city || "",
        // Don't set image and flag directly, we'll handle those separately
        number_of_berths: editingPort.number_of_berths || undefined,
        port_type: editingPort.port_type || "",
        average_tat:
          editingPort.average_tat !== null &&
          editingPort.average_tat !== undefined
            ? typeof editingPort.average_tat === "string"
              ? parseFloat(editingPort.average_tat)
              : editingPort.average_tat
            : undefined,
        port_capacity: editingPort.port_capacity || undefined,
        dominant_cargo: editingPort.dominant_cargo || "",
        lat:
          editingPort.lat !== null && editingPort.lat !== undefined
            ? typeof editingPort.lat === "string"
              ? parseFloat(editingPort.lat)
              : editingPort.lat
            : 0,
        lng:
          editingPort.lng !== null && editingPort.lng !== undefined
            ? typeof editingPort.lng === "string"
              ? parseFloat(editingPort.lng)
              : editingPort.lng
            : 0,
        status:
          editingPort.status === "Active" || editingPort.status === "Inactive"
            ? editingPort.status
            : "Active",
        ind_port_name: editingPort.ind_port_name || "",
        ind_port_lat:
          editingPort.ind_port_lat !== null &&
          editingPort.ind_port_lat !== undefined
            ? typeof editingPort.ind_port_lat === "string"
              ? parseFloat(editingPort.ind_port_lat)
              : editingPort.ind_port_lat
            : undefined,
        ind_port_lng:
          editingPort.ind_port_lng !== null &&
          editingPort.ind_port_lng !== undefined
            ? typeof editingPort.ind_port_lng === "string"
              ? parseFloat(editingPort.ind_port_lng)
              : editingPort.ind_port_lng
            : undefined,
        polyline_curve: editingPort.polyline_curve || undefined,
        polyline_color: editingPort.polyline_color || undefined,
        zoom: editingPort.zoom || undefined,
        zoom_center_lat: editingPort.zoom_center_lat || undefined,
        zoom_center_lng: editingPort.zoom_center_lng || undefined,
      });

      // Find the Indian port if editing a non-Indian port
      if (initialPortLocationType === "Other" && editingPort.ind_port_name) {
        const foundPort = indianPorts.find(
          (p) => p.name === editingPort.ind_port_name
        );
        if (foundPort) {
          setSelectedIndianPort(foundPort);
        }
      }
    } else {
      reset({
        ...defaultValues,
        portLocationType: portType || "",
        country: portType === "Indian" ? "India" : "",
      });
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedFlagFile(null);
    setFlagPreviewUrl(null);
  }, [editingPort, portType, indianPorts]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (flagPreviewUrl) {
        URL.revokeObjectURL(flagPreviewUrl);
      }
    };
  }, [previewUrl, flagPreviewUrl]);

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

  const handleFormSubmit = async (data: Port) => {
    const { flag, image, ...rest } = data;
    const editingPortId = editingPort?.port_id;

    // New ports need both files; edited ports only when they have none yet.
    if (!(image instanceof File) && !editingPort?.image_s3_name) {
      setError("image", { type: "manual", message: "Image is required" });
      toast.error("Image is required");
      return;
    }
    if (!(flag instanceof File) && !editingPort?.flag_s3_name) {
      setError("flag", { type: "manual", message: "Flag is required" });
      toast.error("Flag is required");
      return;
    }

    // Only files uploaded by this submission are cleaned up if saving fails.
    const uploadedFiles: string[] = [];
    const uploadIfNew = async (
      file: Port["image"],
      type: "image" | "flag",
      currentFileName?: string | null
    ) => {
      if (!(file instanceof File)) return currentFileName ?? null;
      const fileName = await uploadFile(file, type);
      uploadedFiles.push(fileName);
      return fileName;
    };
    const deleteFiles = (fileNames: (string | null | false | undefined)[]) =>
      Promise.all(
        fileNames
          .filter((fileName): fileName is string => !!fileName)
          .map((fileName) => deleteFileUrl({ fileName }))
      );

    try {
      const formData = {
        ...rest,
        flag_s3_name: await uploadIfNew(flag, "flag", editingPort?.flag_s3_name),
        image_s3_name: await uploadIfNew(
          image,
          "image",
          editingPort?.image_s3_name
        ),
      };

      if (editingPort && editingPortId) {
        await updatePort({ port_id: editingPortId, data: formData }).unwrap();
        // Replaced files are removed only once the port points at the new ones.
        await deleteFiles([
          image instanceof File && editingPort.image_s3_name,
          flag instanceof File && editingPort.flag_s3_name,
        ]);
        toast.success(`Port ${editingPort.name} updated successfully.`);
      } else {
        await addPort(formData).unwrap();
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
      await deleteFiles(uploadedFiles);
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
                      {...register("lat", {
                        valueAsNumber: true,
                        required: "Latitude is required",
                      })}
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
                      {...register("lng", {
                        valueAsNumber: true,
                        required: "Longitude is required",
                      })}
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

              {/* Section 3: Image Uploads */}
              <section>
                <h3 className='text-lg font-medium mb-4'>Port Visuals</h3>
                <div className='grid md:grid-cols-2 gap-6'>
                  {/* Port Image Upload */}
                  <div className='space-y-3 p-4 border rounded-lg bg-card/50'>
                    <Label className='text-base font-medium block mb-2'>
                      Port Image
                    </Label>
                    {!editingPort ? (
                      // ADD MODE
                      <div className='space-y-3'>
                        <Label
                          htmlFor='port-image-add'
                          className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/80 hover:bg-muted/50 dark:hover:bg-muted/80 dark:bg-card/60 dark:border-muted-foreground/50 dark:hover:border-muted-foreground transition-colors'>
                          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                            <Upload className='w-8 h-8 mb-3 text-muted-foreground' />
                            <p className='mb-2 text-sm text-muted-foreground'>
                              <span className='font-semibold'>
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              PNG, JPG, JPEG
                            </p>
                          </div>
                          <Input
                            id='port-image-add'
                            type='file'
                            accept='image/*,.png,.jpg,.jpeg'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size > 500 * 1024) {
                                toast.error("Image must be 500KB or less");
                                e.target.value = "";
                                return;
                              }
                              handleImageChange(e);
                            }}
                            className='sr-only'
                          />
                        </Label>
                        {previewUrl && (
                          <div className='flex items-center justify-between mt-3 p-2 border rounded-md bg-muted/50'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-24 h-16 object-cover rounded-md border'>
                                <Image
                                  src={previewUrl}
                                  alt='Port preview'
                                  className='h-full w-full object-cover rounded-md border'
                                  width={94}
                                  height={64}
                                />
                              </div>
                              <p className='text-sm font-medium text-muted-foreground truncate max-w-[150px]'>
                                {selectedFile?.name || "Image ready"}
                              </p>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={clearPortImage}
                              className='text-destructive hover:text-destructive bg-destructive/10 h-8 w-8 px-7'>
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // EDIT MODE
                      <div className='space-y-3'>
                        <p className='text-sm font-medium text-muted-foreground mb-1'>
                          Current Image:
                        </p>
                        {imageData?.url ? (
                          <div className='p-4 w-full h-64 object-cover border rounded-md bg-muted/50 inline-block mb-3'>
                            <Image
                              src={imageData?.url}
                              alt='Current Port'
                              className='w-full h-full object-cover rounded-md'
                              width={160}
                              height={120}
                              // Short-lived signed S3 URL: skip the optimizer.
                              unoptimized
                            />
                          </div>
                        ) : editingPort.image_s3_name ? (
                          <p className='text-sm text-muted-foreground italic mb-3'>
                            Loading image...
                          </p>
                        ) : (
                          <p className='text-sm text-muted-foreground italic mb-3'>
                            No image uploaded.
                          </p>
                        )}

                        <div className='pt-3 border-t'>
                          <Label
                            htmlFor='port-image-update' // Unique ID for edit mode
                            className='text-sm font-medium text-muted-foreground block mb-1'>
                            Change Image:
                          </Label>
                          <Label
                            htmlFor='port-image-update' // Match the input ID
                            className='relative flex items-center justify-center w-full border rounded-lg cursor-pointer bg-card/80 hover:bg-muted/50 dark:hover:bg-muted/80 dark:bg-card/60 dark:border-muted-foreground/50 dark:hover:border-muted-foreground transition-colors p-2'>
                            <span className='text-sm text-primary hover:underline'>
                              Choose a different image
                            </span>
                            <Input
                              id='port-image-update' // Ensure this ID matches the htmlFor
                              type='file'
                              accept='image/*,.png,.jpg,.jpeg'
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size > 500 * 1024) {
                                  toast.error("Image must be 500KB or less");
                                  e.target.value = "";
                                  return;
                                }
                                handleImageChange(e);
                              }}
                              className='sr-only'
                            />
                          </Label>

                          {previewUrl && (
                            <div className='flex items-center justify-between mt-3 p-2 border rounded-md bg-muted/50'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-24 h-16 object-cover rounded-md border'>
                                  <Image
                                    src={previewUrl}
                                    width={64}
                                    height={64}
                                    alt='New port preview'
                                    className='h-full w-full object-cover rounded-md border'
                                  />
                                </div>
                                <p className='text-sm font-medium text-muted-foreground truncate max-w-[150px]'>
                                  {selectedFile?.name || "New image ready"}
                                </p>
                              </div>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={clearPortImage}
                                className='text-destructive hover:text-destructive bg-destructive/10 h-8 w-8 px-7'>
                                Clear
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {errors.image && (
                      <p className='text-sm text-destructive'>
                        {errors.image.message}
                      </p>
                    )}
                  </div>

                  {/* Flag Image Upload */}
                  <div className='space-y-3 p-4 border rounded-lg bg-card/50'>
                    <Label className='text-base font-medium block mb-2'>
                      Flag Image
                    </Label>
                    {!editingPort ? (
                      // ADD MODE
                      <div className='space-y-3'>
                        <Label
                          htmlFor='flag-image-add'
                          className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/80 hover:bg-muted/50 dark:hover:bg-muted/80 dark:bg-card/60 dark:border-muted-foreground/50 dark:hover:border-muted-foreground transition-colors'>
                          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                            <Upload className='w-8 h-8 mb-3 text-muted-foreground' />
                            <p className='mb-2 text-sm text-muted-foreground'>
                              <span className='font-semibold'>
                                Click to upload flag
                              </span>
                            </p>
                          </div>
                          <Input
                            id='flag-image-add'
                            type='file'
                            accept='image/*,.png,.jpg,.jpeg'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size > 100 * 1024) {
                                toast.error("Flag must be 100KB or less");
                                e.target.value = "";
                                return;
                              }
                              handleFlagChange(e);
                            }}
                            className='sr-only'
                          />
                        </Label>
                        {flagPreviewUrl && (
                          <div className='flex items-center justify-between mt-3 p-2 border rounded-md bg-muted/50'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-24 h-16 object-cover rounded-md border'>
                                <Image
                                  src={flagPreviewUrl}
                                  alt='Flag preview'
                                  className='h-full w-full object-cover rounded-md border'
                                  width={94}
                                  height={64}
                                />
                              </div>
                              <p className='text-sm font-medium text-muted-foreground truncate max-w-[150px]'>
                                {selectedFlagFile?.name || "Flag ready"}
                              </p>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={clearFlagImage}
                              className='text-destructive hover:text-destructive bg-destructive/10 h-8 w-8 px-7'>
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // EDIT MODE
                      <div className='space-y-3'>
                        <p className='text-sm font-medium text-muted-foreground mb-1'>
                          Current Flag:
                        </p>
                        {flagData?.url ? (
                          <div className='p-4 w-full h-64 object-cover border rounded-md bg-muted/50 inline-block mb-3'>
                            <Image
                              src={flagData?.url}
                              alt='Current Flag'
                              className='w-full h-full object-cover rounded-md'
                              width={160}
                              height={120}
                              // Short-lived signed S3 URL: skip the optimizer.
                              unoptimized
                            />
                          </div>
                        ) : editingPort.flag_s3_name ? (
                          <p className='text-sm text-muted-foreground italic mb-3'>
                            Loading flag...
                          </p>
                        ) : (
                          <p className='text-sm text-muted-foreground italic mb-3'>
                            No flag uploaded.
                          </p>
                        )}

                        <div className='pt-3 border-t'>
                          <Label
                            htmlFor='flag-image-update' // Unique ID for edit mode
                            className='text-sm font-medium text-muted-foreground block mb-1'>
                            Change Flag:
                          </Label>
                          <Label
                            htmlFor='flag-image-update' // Match the input ID
                            className='relative flex items-center justify-center w-full border rounded-lg cursor-pointer bg-card/80 hover:bg-muted/50 dark:hover:bg-muted/80 dark:bg-card/60 dark:border-muted-foreground/50 dark:hover:border-muted-foreground transition-colors p-2'>
                            <span className='text-sm text-primary hover:underline'>
                              Choose a different flag
                            </span>
                            <Input
                              id='flag-image-update' // Ensure this ID matches the htmlFor
                              type='file'
                              accept='image/*,.png,.jpg,.jpeg'
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size > 100 * 1024) {
                                  toast.error("Flag must be 100KB or less");
                                  e.target.value = "";
                                  return;
                                }
                                handleFlagChange(e);
                              }}
                            />
                          </Label>
                          {flagPreviewUrl && (
                            <div className='flex items-center justify-between mt-3 p-2 border rounded-md bg-muted/50'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-24 h-16 object-cover rounded-md border'>
                                  <Image
                                    src={flagPreviewUrl}
                                    width={94}
                                    height={64}
                                    alt='New flag preview'
                                    className='h-full w-full object-cover rounded-md border'
                                  />
                                </div>
                                <p className='text-sm font-medium text-muted-foreground truncate max-w-[150px]'>
                                  {selectedFlagFile?.name || "New flag ready"}
                                </p>
                              </div>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={clearFlagImage}
                                className='text-destructive hover:text-destructive bg-destructive/10 h-8 w-8 px-7'>
                                Clear
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {errors.flag && (
                      <p className='text-sm text-destructive'>
                        {errors.flag.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 4: Optional Information */}
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
                      {...register("number_of_berths", {
                        valueAsNumber: true,
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
                      step='any'
                      {...register("average_tat", {
                        valueAsNumber: true,
                        // required: "Average TAT is required", // Make optional
                      })}
                      placeholder='E.g., 2.5'
                    />
                    {errors.average_tat && (
                      <p className='text-sm text-destructive'>
                        {errors.average_tat.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='port_capacity'>
                      Port Capacity (TEU/Year)
                    </Label>
                    <Input
                      id='port_capacity'
                      type='number'
                      {...register("port_capacity", {
                        valueAsNumber: true,
                        // required: "Port Capacity is required", // Make optional
                      })}
                      placeholder='E.g., 5000000'
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

              {/* Section 5: Conditional Fields */}
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
                        {...register("zoom_center_lat", {
                          valueAsNumber: true,
                          required: "Zoom Center Latitude is required",
                        })}
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
                        {...register("zoom_center_lng", {
                          valueAsNumber: true,
                          required: "Zoom Center Longitude is required",
                        })}
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
                          valueAsNumber: true,
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
                          })}
                          placeholder='#FF0000'
                          className='flex-grow'
                        />
                        <Input
                          type='color'
                          onChange={(e) =>
                            setValue("polyline_color", e.target.value)
                          }
                          value={watch("polyline_color") || "#007aff"} // Default color
                          className='h-10 w-12 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent'
                          style={{
                            backgroundColor:
                              watch("polyline_color") || "#007aff",
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
                        step='any'
                        {...register("polyline_curve", {
                          valueAsNumber: true,
                          required: "Polyline Curve factor is required",
                        })}
                        placeholder='E.g., 0.5 (0 to 1)'
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
                          {watchedLat}
                        </p>
                        <p>
                          <span className='text-muted-foreground'>Lng:</span>{" "}
                          {watchedLng}
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
