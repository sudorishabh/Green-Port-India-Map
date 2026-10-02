"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KpiForm } from "@/components/portal/kpi-form";
import type { KpiInput } from "@/lib/schemas/kpi";
import { toast } from "sonner";
import {
  useGetKpisQuery,
  useAddKpiMutation,
  useUpdateKpiMutation,
  useDeleteKpiMutation,
} from "@/lib/portal/features/kpis/kpisApiSlice";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { Kpis } from "@/lib/portal/types";
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  BarChart2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NO_KPIS: Kpis[] = [];

export default function KpisPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKpi, setIsKpi] = useState<Kpis | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const {
    data,
    error: getKpisError,
    isLoading: isLoadingKpis,
  } = useGetKpisQuery();
  const kpis = data?.data ?? NO_KPIS;

  const [addKpi, { isLoading: isAddingKpi }] = useAddKpiMutation();
  const [updateKpi, { isLoading: isUpdatingKpi }] = useUpdateKpiMutation();
  const [deleteKpi, { isLoading: isDeletingKpi }] = useDeleteKpiMutation();

  const filteredKpis = useMemo(() => {
    if (!searchFilter) return kpis;
    const query = searchFilter.toLowerCase();
    return kpis.filter(
      ({ kpiData }) =>
        kpiData.kpi_category?.toLowerCase().includes(query) ||
        kpiData.kpi?.toLowerCase().includes(query)
    );
  }, [kpis, searchFilter]);

  const handleAddKpi = () => {
    setIsKpi(null);
    setIsDialogOpen(true);
  };

  const handleEditKpi = (kpiToEdit: Kpis) => {
    setIsKpi(kpiToEdit);
    setIsDialogOpen(true);
  };

  const handleDeleteKpi = async (kpiId: number) => {
    if (
      !confirm(
        `Are you sure you want to delete KPI ID ${kpiId}? This action cannot be undone.`
      )
    )
      return;
    const toastId = toast.loading(`Deleting KPI ${kpiId}...`);
    try {
      await deleteKpi(kpiId).unwrap();
      toast.success(`KPI ${kpiId} deleted successfully.`, { id: toastId });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to delete KPI. Please try again."),
        { id: toastId }
      );
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsKpi(null);
  };

  const handleFormSubmit = async (data: KpiInput) => {
    const kpiToSubmit = isKpi?.kpiData;
    const isEditing = !!kpiToSubmit?.kpi_id;
    const actionText = isEditing ? "Updating" : "Adding";
    const toastId = toast.loading(`${actionText} KPI...`);

    try {
      if (isEditing) {
        await updateKpi({
          kpi_id: kpiToSubmit.kpi_id!,
          data,
        }).unwrap();
      } else {
        await addKpi(data).unwrap();
      }
      toast.success(`KPI ${isEditing ? "updated" : "added"} successfully.`, {
        id: toastId,
      });
      handleCloseDialog();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to ${actionText.toLowerCase()} KPI. Please try again.`
        ),
        { id: toastId }
      );
    }
  };

  if (getKpisError) {
    return (
      <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8 text-red-600'>
        Error loading KPIs. Please try again later.
      </div>
    );
  }

  const isLoadingForm = isAddingKpi || isUpdatingKpi;

  return (
    <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            KPI Management
          </h1>
          <p className='text-muted-foreground mt-1'>
            Manage Key Performance Indicators and related targets.
          </p>
        </div>
        <Button
          variant='outline'
          className='border-sky-500 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-800 mt-4 md:mt-0'
          onClick={handleAddKpi}
          disabled={isLoadingKpis || isAddingKpi}>
          <PlusCircle className='mr-2 h-4 w-4 cursor-pointer' />
          Add New KPI
        </Button>
      </div>

      {isLoadingKpis ? (
        <div className='flex justify-center items-center py-16'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-3 text-muted-foreground'>Loading KPIs...</span>
        </div>
      ) : kpis.length === 0 && !searchFilter ? (
        <Card className='mt-8 text-center py-16 border-dashed border-border/60 bg-muted/20'>
          <CardHeader>
            <BarChart2 className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
            <CardTitle className='text-xl font-semibold'>
              No KPIs Found
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Get started by adding your first Key Performance Indicator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant='outline'
              className='border-sky-500 text-sky-700 hover:bg-sky-50 cursor-pointer hover:text-sky-800'
              onClick={handleAddKpi}>
              <PlusCircle className='mr-2 h-4 w-4' />
              Add New KPI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className='shadow-md border-border/40 rounded-lg overflow-hidden bg-card'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4 bg-muted/50 border-b'>
            <div className='flex items-center gap-3'>
              <BarChart2 className='h-5 w-5 text-sky-700' />
              <CardTitle className='text-lg font-semibold'>
                Key Performance Indicators
              </CardTitle>
              <Badge
                variant='secondary'
                className='rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 border-sky-200'>
                {filteredKpis.length}
              </Badge>
              <CardDescription className='hidden md:block text-sm pl-2'>
                Track and manage KPIs and targets
              </CardDescription>
            </div>
            <div className='relative w-full max-w-xs'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by category or KPI...'
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className='pl-9 h-9 rounded-md'
              />
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-muted/30'>
                <TableRow>
                  <TableHead className='pl-6 w-[20%]'>Category</TableHead>
                  <TableHead className='w-[30%]'>KPI</TableHead>
                  <TableHead>International Target</TableHead>
                  <TableHead>National Target</TableHead>
                  <TableHead className='text-right pr-6 w-44'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground italic pl-6'>
                      {searchFilter
                        ? "No matching KPIs found."
                        : "No KPIs available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKpis.map((item) => {
                    const kpiObject = item.kpiData;

                    return (
                      <TableRow
                        key={kpiObject.kpi_id}
                        className='hover:bg-muted/50 transition-colors'>
                        <TableCell className='font-medium pl-6'>
                          {kpiObject.kpi_category}
                        </TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {kpiObject.kpi}
                        </TableCell>
                        <TableCell>
                          {kpiObject.kpi_international_target}
                        </TableCell>
                        <TableCell>{kpiObject.kpi_national_target}</TableCell>
                        <TableCell className='text-right pr-6'>
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleEditKpi(item)
                              }
                              disabled={isDeletingKpi || isLoadingForm}
                              className='h-8 cursor-pointer hover:bg-sky-700/10 text-sky-800 flex items-center'>
                              <Edit className='h-4 w-4 mr-1' />
                              Edit
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteKpi(kpiObject.kpi_id)}
                              disabled={isDeletingKpi || isLoadingForm}
                              className='h-8 cursor-pointer hover:bg-red-700/10 text-red-800 flex items-center'>
                              {isDeletingKpi &&
                              isKpi?.kpiData.kpi_id === kpiObject.kpi_id ? (
                                <Loader2 className='h-4 w-4 animate-spin mr-1' />
                              ) : (
                                <Trash2 className='h-4 w-4 mr-1' />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <KpiForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        isKpi={isKpi}
        isLoading={isLoadingForm}
      />
    </div>
  );
}
