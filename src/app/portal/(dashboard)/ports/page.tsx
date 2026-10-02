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
import { PortForm } from "@/components/portal/port-form";
import { toast } from "sonner";
import {
  useGetPortsQuery,
  useDeletePortMutation,
} from "@/lib/portal/features/ports/portsApiSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  PlusCircle,
  Edit,
  Trash2,
  FileText,
  MapPin,
  Globe,
  Loader2,
} from "lucide-react";
import { Port } from "@/lib/portal/types";
import InitiativeForm from "@/components/portal/initiative-form";
import { getApiErrorMessage } from "@/lib/portal/api-errors";

const NO_PORTS: Port[] = [];

export default function PortsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [addPortType, setAddPortType] = useState<"Indian" | "Other" | null>(
    null
  );
  const [indianPortFilter, setIndianPortFilter] = useState<string>("");
  const [otherPortFilter, setOtherPortFilter] = useState<string>("");

  const { data, isLoading: isLoadingPorts } = useGetPortsQuery();
  const ports = data?.data ?? NO_PORTS;

  const { filteredIndianPorts, filteredOtherPorts, indianPorts } =
    useMemo(() => {
      const indian: Port[] = [];
      const other: Port[] = [];

      ports.forEach((port) => {
        if (port.country === "India") {
          indian.push(port);
        } else {
          other.push(port);
        }
      });

      const filteredIndian = indianPortFilter
        ? indian.filter(
            (port) =>
              port.name
                .toLowerCase()
                .includes(indianPortFilter.toLowerCase()) ||
              port.city.toLowerCase().includes(indianPortFilter.toLowerCase())
          )
        : indian;

      const filteredOther = otherPortFilter
        ? other.filter(
            (port) =>
              port.name.toLowerCase().includes(otherPortFilter.toLowerCase()) ||
              port.city.toLowerCase().includes(otherPortFilter.toLowerCase()) ||
              port.country.toLowerCase().includes(otherPortFilter.toLowerCase())
          )
        : other;

      return {
        filteredIndianPorts: filteredIndian,
        filteredOtherPorts: filteredOther,
        indianPorts: indian,
      };
    }, [ports, indianPortFilter, otherPortFilter]);

  const [deletePort, { isLoading: isDeletingPort }] = useDeletePortMutation();

  const handleAddIndianPort = () => {
    setEditingPort(null);
    setAddPortType("Indian");
    setIsDialogOpen(true);
  };

  const handleAddOtherPort = () => {
    setEditingPort(null);
    setAddPortType("Other");
    setIsDialogOpen(true);
  };

  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    setAddPortType(port.country === "India" ? "Indian" : "Other");
    setIsDialogOpen(true);
  };

  const handleDeletePort = async (portId: number) => {
    if (
      !confirm(
        `Are you sure you want to delete port ID ${portId}? This action cannot be undone.`
      )
    ) {
      return;
    }
    const toastId = toast.loading(`Deleting port ${portId}...`);
    try {
      await deletePort(portId).unwrap();
      toast.success(`Port ${portId} deleted successfully.`, { id: toastId });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to delete port. Please try again."),
        { id: toastId }
      );
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPort(null);
    setAddPortType(null);
  };

  const handleManageInitiatives = (portId: number) => {
    setSelectedPortId(portId);
  };

  const renderPortTable = (
    ports: Port[],
    title: string,
    description: string,
    badgeColor: string,
    searchValue: string,
    onSearchChange: (value: string) => void
  ) => (
    <Card className='gap-0 py-0 shadow-md border-border/40 rounded-lg overflow-hidden bg-card'>
      <CardHeader className='flex flex-col gap-3 space-y-0 border-b bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          {/* Icon based on title */}
          {title === "Indian Ports" ? (
            <MapPin className='h-5 w-5 text-emerald-700' />
          ) : (
            <Globe className='h-5 w-5 text-sky-700' />
          )}
          <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
          <Badge
            variant='secondary'
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              title === "Indian Ports"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-sky-100 text-sky-800 border-sky-200"
            }`}>
            {ports.length}
          </Badge>
          <CardDescription className='hidden xl:block text-sm pl-2'>
            {description}
          </CardDescription>
        </div>
        <div className='relative w-full sm:max-w-xs'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, city, country...'
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-9 h-9 rounded-md'
          />
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader className='bg-muted/30'>
            <TableRow>
              <TableHead className='pl-4 sm:pl-6'>Name</TableHead>
              <TableHead className='hidden sm:table-cell'>City</TableHead>
              {title === "International Ports" && (
                <TableHead className='hidden md:table-cell'>Country</TableHead>
              )}
              <TableHead className='hidden sm:table-cell'>Status</TableHead>
              <TableHead className='pr-4 text-right sm:pr-6'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={title === "International Ports" ? 5 : 4}
                  className='h-24 text-center text-muted-foreground italic pl-6'>
                  {searchValue
                    ? "No matching ports found."
                    : "No ports available."}
                </TableCell>
              </TableRow>
            ) : (
              ports.map((port: Port) => (
                <TableRow
                  key={port.port_id}
                  className='hover:bg-muted/50 transition-colors'>
                  <TableCell className='pl-4 font-medium whitespace-normal sm:pl-6'>
                    {port.name}
                    {/* Columns hidden on small screens fold in under the name. */}
                    <span className='block text-xs font-normal text-muted-foreground sm:hidden'>
                      {title === "International Ports"
                        ? `${port.city}, ${port.country}`
                        : port.city}
                      {port.status !== "Active" && ` · ${port.status}`}
                    </span>
                    {title === "International Ports" && (
                      <span className='hidden text-xs font-normal text-muted-foreground sm:block md:hidden'>
                        {port.country}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    {port.city}
                  </TableCell>
                  {title === "International Ports" && (
                    <TableCell className='hidden md:table-cell'>
                      {port.country}
                    </TableCell>
                  )}
                  <TableCell className='hidden sm:table-cell'>
                    <Badge
                      variant={port.status === "Active" ? "default" : "outline"}
                      className={`capitalize ${
                        port.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : ""
                      }`}>
                      {port.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='pr-4 sm:pr-6'>
                    {/* Icon buttons until there is room for their labels. */}
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        title='Edit'
                        onClick={() => handleEditPort(port)}
                        disabled={isDeletingPort}
                        className='cursor-pointer text-sky-800 hover:bg-sky-700/10'>
                        <Edit className='h-4 w-4' />
                        <span className='sr-only xl:not-sr-only'>Edit</span>
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        title='Initiatives'
                        onClick={() => handleManageInitiatives(port.port_id!)}
                        disabled={!port.port_id || isDeletingPort}
                        className='cursor-pointer text-emerald-800 hover:bg-emerald-700/10'>
                        <FileText className='h-4 w-4' />
                        <span className='sr-only xl:not-sr-only'>
                          Initiatives
                        </span>
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        title='Delete'
                        onClick={() => handleDeletePort(port.port_id!)}
                        disabled={!port.port_id || isDeletingPort}
                        className='cursor-pointer text-red-800 hover:bg-red-700/10'>
                        {isDeletingPort && selectedPortId === port.port_id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                        <span className='sr-only xl:not-sr-only'>Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className='mx-auto max-w-7xl'>
      {/* Page Header */}
      <div className='mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
            Ports Management
          </h1>
          <p className='text-muted-foreground mt-1'>
            Administer Indian and International port master data.
          </p>
        </div>

        <div className='flex flex-wrap gap-2 sm:gap-3 md:shrink-0'>
          <Button
            variant='outline'
            className='border-emerald-500 text-emerald-700 hover:bg-emerald-50 cursor-pointer hover:text-emerald-800'
            onClick={handleAddIndianPort}
            disabled={isLoadingPorts}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Indian Port
          </Button>
          <Button
            variant='outline'
            className='border-sky-700 text-sky-700 hover:bg-sky-700 cursor-pointer hover:text-white'
            onClick={handleAddOtherPort}
            disabled={isLoadingPorts}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Other Port
          </Button>
        </div>
      </div>

      {/* Separator */}
      {/* <Separator className='my-6' /> Removed as spacing is handled by layout */}

      {isLoadingPorts ? (
        // Enhanced Loading State
        <div className='space-y-6 mt-8'>
          {/* Basic Loading Indicator */}
          <div className='flex justify-center items-center py-16'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            <span className='ml-3 text-muted-foreground'>Loading Ports...</span>
          </div>
        </div>
      ) : ports.length === 0 ? (
        // Added distinct state for zero ports initially
        <Card className='mt-8 text-center py-16 border-dashed border-border/60 bg-muted/20'>
          <CardHeader>
            <MapPin className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
            <CardTitle className='text-xl font-semibold'>
              No Ports Found
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Get started by adding your first Indian or International port.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap justify-center gap-3 mt-2'>
              <Button
                variant='outline'
                className='border-emerald-500 text-emerald-700 hover:bg-emerald-50 cursor-pointer hover:text-emerald-800'
                onClick={handleAddIndianPort}>
                <PlusCircle className='mr-2 h-4 w-4' />
                Add Indian Port
              </Button>
              <Button
                variant='outline'
                className='border-sky-700 text-sky-700 hover:bg-sky-50 cursor-pointer hover:text-sky-800'
                onClick={handleAddOtherPort}>
                <PlusCircle className='mr-2 h-4 w-4' />
                Add Other Port
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          defaultValue='indian'
          className='w-full mt-8'>
          <TabsList className='mb-6 grid w-full grid-cols-2 rounded-lg bg-muted sm:w-[400px]'>
            <TabsTrigger
              value='indian'
              className='data-[state=active]:bg-background data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm  rounded-md cursor-pointer text-sm font-medium transition-all flex items-center justify-center gap-2'>
              <MapPin className='h-4 w-4' /> Indian Ports
            </TabsTrigger>
            <TabsTrigger
              value='other'
              className='data-[state=active]:bg-background data-[state=active]:text-sky-700 data-[state=active]:shadow-sm rounded-md cursor-pointer text-sm font-medium transition-all flex items-center justify-center gap-2'>
              <Globe className='h-4 w-4' /> Other Ports
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='indian'
            className='mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
            {renderPortTable(
              filteredIndianPorts,
              "Indian Ports",
              "Manage ports located within India",
              "bg-emerald-100 text-emerald-800", // Keep badge color info if needed elsewhere, but styling applied directly now
              indianPortFilter,
              setIndianPortFilter
            )}
          </TabsContent>

          <TabsContent
            value='other'
            className='mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
            {renderPortTable(
              filteredOtherPorts,
              "International Ports",
              "Manage international ports connected to Indian ports",
              "bg-indigo-100 text-indigo-800", // Keep badge color info if needed elsewhere
              otherPortFilter,
              setOtherPortFilter
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Render the PortForm Dialog */}
      <PortForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editingPort={editingPort}
        portType={addPortType}
        indianPorts={indianPorts}
        partnerPorts={
          editingPort
            ? ports.filter((port) => port.ind_port_name === editingPort.name)
            : NO_PORTS
        }
      />

      <InitiativeForm
        selectedPortId={selectedPortId}
        portName={ports.find((port) => port.port_id === selectedPortId)?.name}
        setSelectedPortId={setSelectedPortId}
        open={!!selectedPortId}
        onOpenChange={() => setSelectedPortId(null)}
      />
    </div>
  );
}
