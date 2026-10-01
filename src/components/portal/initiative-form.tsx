import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddGreenInitiativeMutation,
  useGetKpisQuery,
  useGetPortInitiativesQuery,
  useUpdateGreenInitiativeMutation,
  useDeleteGreenInitiativeMutation,
} from "@/lib/portal/features/kpis/kpisApiSlice";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { Initiative } from "@/lib/portal/types";

const InitiativeForm = ({
  selectedPortId,
  setSelectedPortId,
  open,
  onOpenChange,
}: {
  selectedPortId: number | null;
  setSelectedPortId: (id: number | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [selectedKpiId, setSelectedKpiId] = useState<number | null>(null);
  const [isAddOrEditInitiativeOpen, setIsAddOrEditInitiativeOpen] =
    useState(false);
  const [initiativeName, setInitiativeName] = useState("");
  const [initiativeUrl, setInitiativeUrl] = useState("");
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(
    null
  );

  const { data: initiativesData, refetch: refetchInitiatives } =
    useGetPortInitiativesQuery(selectedPortId as number, {
      skip: !selectedPortId,
    });
  const { data: kpisData } = useGetKpisQuery();
  const [addGreenInitiative, { isLoading: isAddingInitiative }] =
    useAddGreenInitiativeMutation();
  const [updateGreenInitiative, { isLoading: isUpdatingInitiative }] =
    useUpdateGreenInitiativeMutation();
  const [deleteGreenInitiative, { isLoading: isDeletingInitiative }] =
    useDeleteGreenInitiativeMutation();

  const handleCloseInitiativeDialog = () => {
    onOpenChange(false);
    setSelectedPortId(0);
    setSelectedKpiId(null);
    setIsAddOrEditInitiativeOpen(false);
    setEditingInitiative(null);
    setInitiativeName("");
    setInitiativeUrl("");
  };

  const handleOpenAddInitiativeForm = (kpiId: number) => {
    setEditingInitiative(null);
    setSelectedKpiId(kpiId);
    setInitiativeName("");
    setInitiativeUrl("");
    setIsAddOrEditInitiativeOpen(true);
  };

  const handleOpenEditInitiativeForm = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setInitiativeName(initiative.initiative);
    setInitiativeUrl(initiative.initiative_url);
    setSelectedKpiId(initiative.kpi_id);
    setIsAddOrEditInitiativeOpen(true);
  };

  const handleDeleteInitiativeConfirmation = async (initiative: Initiative) => {
    if (
      window.confirm(
        `Are you sure you want to delete the initiative: "${initiative.initiative}"?`
      )
    ) {
      try {
        await deleteGreenInitiative(initiative.initiative_id).unwrap();
        toast.success("Initiative deleted successfully!");
        refetchInitiatives();
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Failed to delete initiative. Please try again."
          )
        );
      }
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmitInitiative = async () => {
    if (!selectedKpiId || !selectedPortId) {
      toast.error("KPI ID or Port ID is missing.");
      return;
    }
    if (!initiativeName.trim()) {
      toast.error("Initiative name cannot be empty.");
      return;
    }
    if (!isValidUrl(initiativeUrl)) {
      toast.error(
        "Please enter a valid source URL (e.g., http://example.com)."
      );
      return;
    }

    const initiativePayload = {
      initiative: initiativeName,
      kpi_id: selectedKpiId,
      port_id: selectedPortId,
      initiative_url: initiativeUrl,
    };

    try {
      if (editingInitiative) {
        await updateGreenInitiative({
          initiative_id: editingInitiative.initiative_id,
          initiative: initiativePayload,
        }).unwrap();
        toast.success("Initiative updated successfully!");
      } else {
        await addGreenInitiative(initiativePayload).unwrap();
        toast.success("Initiative added successfully!");
      }
      refetchInitiatives();
      setIsAddOrEditInitiativeOpen(false);
      setEditingInitiative(null);
      setInitiativeName("");
      setInitiativeUrl("");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Failed to ${
            editingInitiative ? "update" : "add"
          } initiative. Please try again.`
        )
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-6xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            Port Initiatives for
            {/* {selectedPort || `Port ID: ${selectedPortId}`} */}
          </DialogTitle>
        </DialogHeader>

        {!isAddOrEditInitiativeOpen ? (
          <div className='space-y-6'>
            {kpisData?.data.map(({ kpiData }) => {
              const kpiInitiatives = initiativesData?.data.filter(
                (initiative: Initiative) => initiative.kpi_id === kpiData.kpi_id
              );

              return (
                <div
                  key={kpiData.kpi_id}
                  className='border rounded-lg p-4 bg-gray-50'>
                  <div className='flex justify-between items-center mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-sky-800'>
                        {kpiData.kpi}
                      </h3>
                      <div>
                        <p className='text-xs text-gray-500'>
                          National Target: {kpiData.kpi_national_target}
                        </p>
                        <p className='text-xs text-gray-500'>
                          International Target:{" "}
                          {kpiData.kpi_international_target}
                        </p>
                      </div>
                    </div>
                    <Button
                      className='bg-sky-700 hover:bg-sky-800 cursor-pointer'
                      size='sm'
                      onClick={() =>
                        handleOpenAddInitiativeForm(kpiData.kpi_id)
                      }>
                      Add Initiative
                    </Button>
                  </div>
                  {kpiInitiatives && kpiInitiatives.length > 0 ? (
                    <div className='space-y-3'>
                      {kpiInitiatives.map((initiative: Initiative) => (
                        <div
                          key={initiative.initiative_id}
                          className='bg-white p-3 rounded border flex justify-between items-center'>
                          <div className='flex-1'>
                            <h4 className='font-medium'>
                              {initiative.initiative}
                            </h4>
                            <p className='text-sm text-gray-700'>
                              {initiative.initiative_url}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              className='bg-sky-100 text-sky-800 hover:bg-sky-200 cursor-pointer'
                              size='sm'
                              onClick={() =>
                                handleOpenEditInitiativeForm(initiative)
                              }>
                              Edit
                            </Button>
                            <Button
                              className='bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                              size='sm'
                              onClick={() =>
                                handleDeleteInitiativeConfirmation(initiative)
                              }>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-gray-500 italic text-center py-3 bg-white rounded border'>
                      No initiatives yet for this KPI
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className='border rounded-lg p-6 bg-white'>
            <DialogHeader>
              <DialogTitle>
                {editingInitiative ? "Edit" : "Add New"} Initiative for{" "}
                {
                  kpisData?.data.find(
                    (kpi) => kpi.kpiData.kpi_id === selectedKpiId
                  )?.kpiData.kpi
                }
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='initiative-name'>
                  {editingInitiative ? "Edit" : "Fill"} Initiative Name
                </Label>
                <Input
                  id='initiative-name'
                  placeholder='Enter initiative name'
                  value={initiativeName}
                  onChange={(e) => setInitiativeName(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='initiative-url'>Source URL</Label>
                <Input
                  id='initiative-url'
                  placeholder='Enter source URL (e.g., http://example.com)'
                  value={initiativeUrl}
                  onChange={(e) => setInitiativeUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsAddOrEditInitiativeOpen(false);
                  setEditingInitiative(null);
                  setInitiativeName("");
                  setInitiativeUrl("");
                }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInitiative}
                disabled={
                  isAddingInitiative ||
                  isUpdatingInitiative ||
                  isDeletingInitiative
                }>
                {editingInitiative ? "Update" : "Save"} Initiative
                {(isAddingInitiative || isUpdatingInitiative) && "..."}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isAddOrEditInitiativeOpen && (
          <DialogFooter>
            <Button
              variant='outline'
              onClick={handleCloseInitiativeDialog}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InitiativeForm;
