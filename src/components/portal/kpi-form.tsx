"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, PlusCircle, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Kpis } from "@/lib/portal/types";
import { kpiSchema, type KpiInput } from "@/lib/schemas/kpi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type KpiFormValues = z.input<typeof kpiSchema>;

const EMPTY_FORM: KpiFormValues = {
  kpi_category: "",
  kpi: "",
  kpi_international_target: "",
  kpi_national_target: "",
  kpi_target_links: [],
};

interface KpiFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KpiInput) => void;
  isLoading?: boolean;
  /** The KPI being edited, or null when adding a new one. */
  isKpi: Kpis | null;
}

export function KpiForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isKpi,
}: KpiFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KpiFormValues, unknown, KpiInput>({
    resolver: zodResolver(kpiSchema),
    defaultValues: EMPTY_FORM,
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: "kpi_target_links",
  });

  // Start from the saved KPI, or a blank form, every time the dialog opens, so
  // a cancelled Add doesn't leave its values behind for the next one.
  useEffect(() => {
    if (!isOpen) return;
    if (!isKpi) {
      reset(EMPTY_FORM);
      return;
    }

    const { kpiData, targetsLinks } = isKpi;
    reset({
      kpi_category: kpiData.kpi_category || "",
      kpi: kpiData.kpi || "",
      kpi_international_target: kpiData.kpi_international_target || "",
      kpi_national_target: kpiData.kpi_national_target || "",
      kpi_target_links: [
        ...targetsLinks.national,
        ...targetsLinks.international,
      ].map(({ target_type, link_url }) => ({ target_type, link_url })),
    });
  }, [isOpen, isKpi, reset]);

  const handleFormSubmitInternal = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-6 bg-gradient-to-br from-background to-muted'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold tracking-tight'>
            {isKpi ? "Edit KPI" : "Add New KPI"}
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Fill in the details for the Key Performance Indicator.
          </DialogDescription>
        </DialogHeader>

        <Card className='border-none shadow-none bg-transparent'>
          <CardContent className='p-0 pt-6'>
            <form
              onSubmit={handleFormSubmitInternal}
              className='grid gap-6'>
              {/* Section 1: Basic KPI Information */}
              <section className='p-5 border rounded-lg bg-card/50'>
                <h3 className='text-lg font-medium mb-4 flex items-center'>
                  <Badge className='mr-2 bg-primary/20 text-primary hover:bg-primary/30 border-none'>
                    1
                  </Badge>
                  Basic Information
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='kpi_category'>KPI Category *</Label>
                    <Input
                      id='kpi_category'
                      {...register("kpi_category")}
                      placeholder='e.g., Efficiency, Sustainability'
                    />
                    {errors.kpi_category && (
                      <p className='text-sm text-destructive'>
                        {errors.kpi_category.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='kpi'>KPI Name *</Label>
                    <Textarea
                      id='kpi'
                      {...register("kpi")}
                      className='resize-none h-20'
                      placeholder='Describe the Key Performance Indicator'
                    />
                    {errors.kpi && (
                      <p className='text-sm text-destructive'>
                        {errors.kpi.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 2: Target Information */}
              <section className='p-5 border rounded-lg bg-card/50'>
                <h3 className='text-lg font-medium mb-4 flex items-center'>
                  <Badge className='mr-2 bg-primary/20 text-primary hover:bg-primary/30 border-none'>
                    2
                  </Badge>
                  Target Information
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='kpi_international_target'
                      className='flex items-center'>
                      International Target *
                      <Badge className='ml-2 bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30'>
                        International
                      </Badge>
                    </Label>
                    <Textarea
                      id='kpi_international_target'
                      {...register("kpi_international_target")}
                      className='resize-none h-24'
                      placeholder='Define the international target'
                    />
                    {errors.kpi_international_target && (
                      <p className='text-sm text-destructive'>
                        {errors.kpi_international_target.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='kpi_national_target'
                      className='flex items-center'>
                      National Target *
                      <Badge className='ml-2 bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30'>
                        National
                      </Badge>
                    </Label>
                    <Textarea
                      id='kpi_national_target'
                      {...register("kpi_national_target")}
                      className='resize-none h-24'
                      placeholder='Define the national target'
                    />
                    {errors.kpi_national_target && (
                      <p className='text-sm text-destructive'>
                        {errors.kpi_national_target.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: KPI Target Links */}
              <section className='p-5 border rounded-lg bg-card/50'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-lg font-medium flex items-center'>
                    <Badge className='mr-2 bg-primary/20 text-primary hover:bg-primary/30 border-none'>
                      3
                    </Badge>
                    KPI Target Links
                  </h3>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      appendLink({ target_type: "", link_url: "" })
                    }
                    className='flex items-center gap-1'>
                    <PlusCircle className='h-4 w-4' />
                    Add Link
                  </Button>
                </div>

                <div
                  className={cn(
                    "space-y-4",
                    linkFields.length === 0 &&
                      "p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground"
                  )}>
                  {linkFields.length === 0 ? (
                    <>
                      <LinkIcon className='h-10 w-10 mb-2 opacity-50' />
                      <p>No links added yet</p>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          appendLink({ target_type: "", link_url: "" })
                        }
                        className='mt-2'>
                        Add your first link
                      </Button>
                    </>
                  ) : (
                    linkFields.map((field, index) => (
                      <div
                        key={field.id}
                        className='p-4 border rounded-md space-y-4 bg-background hover:shadow-sm transition-shadow duration-200'>
                        <div className='flex justify-between items-center'>
                          <h4 className='font-medium flex items-center'>
                            <LinkIcon className='h-4 w-4 mr-2 text-muted-foreground' />
                            Link {index + 1}
                          </h4>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeLink(index)}
                            className='text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full p-0'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <Label
                              htmlFor={`kpi_target_links.${index}.target_type`}>
                              Target Type *
                            </Label>
                            <Controller
                              control={control}
                              name={`kpi_target_links.${index}.target_type`}
                              render={({ field: controllerField }) => (
                                <Select
                                  onValueChange={controllerField.onChange}
                                  value={controllerField.value}>
                                  <SelectTrigger
                                    id={`kpi_target_links.${index}.target_type`}>
                                    <SelectValue placeholder='Select Target Type' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='National'>
                                      <span className='flex items-center'>
                                        National
                                        <Badge className='ml-2 bg-green-500/20 text-green-700 dark:text-green-300'>
                                          National
                                        </Badge>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value='International'>
                                      <span className='flex items-center'>
                                        International
                                        <Badge className='ml-2 bg-blue-500/20 text-blue-700 dark:text-blue-300'>
                                          International
                                        </Badge>
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.kpi_target_links?.[index]?.target_type && (
                              <p className='text-sm text-destructive'>
                                {
                                  errors.kpi_target_links?.[index]?.target_type
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div className='space-y-2'>
                            <Label
                              htmlFor={`kpi_target_links.${index}.link_url`}>
                              Link URL *
                            </Label>
                            <Input
                              id={`kpi_target_links.${index}.link_url`}
                              {...register(
                                `kpi_target_links.${index}.link_url`
                              )}
                              placeholder='https://example.com'
                            />
                            {errors.kpi_target_links?.[index]?.link_url && (
                              <p className='text-sm text-destructive'>
                                {
                                  errors.kpi_target_links?.[index]?.link_url
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <CardFooter className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white'>
                  {isLoading
                    ? "Saving..."
                    : isKpi
                    ? "Update KPI"
                    : "Create KPI"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
