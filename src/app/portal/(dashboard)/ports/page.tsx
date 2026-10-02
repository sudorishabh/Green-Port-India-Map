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
    <Card className='shadow-md border-border/40 rounded-lg overflow-hidden bg-card'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 p-4 bg-muted/50 border-b'>
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
          <CardDescription className='hidden md:block text-sm pl-2'>
            {description}
          </CardDescription>
        </div>
        <div className='relative w-full max-w-xs'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, city, country...' // More descriptive placeholder
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-9 h-9 rounded-md' // Adjusted padding and height
          />
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {/* Use Table component directly */}
        <Table>
          <TableHeader className='bg-muted/30'>
            <TableRow>
              <TableHead className='pl-6 w-[30%]'>Name</TableHead>
              <TableHead>City</TableHead>
              {title === "International Ports" && (
                <TableHead>Country</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className='w-44'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={title === "International Ports" ? 5 : 4} // Adjust colSpan
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
                  <TableCell className='font-medium pl-6'>
                    {port.name}
                  </TableCell>
                  <TableCell>{port.city}</TableCell>
                  {title === "International Ports" && (
                    <TableCell>{port.country}</TableCell>
                  )}
                  <TableCell>
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
                  <TableCell className='w-44'>
                    <div className='flex gap-4 justify-between'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEditPort(port)}
                        disabled={isDeletingPort}
                        className='h-8 w-16 cursor-pointer hover:bg-sky-700/10 text-sky-800 flex items-center'>
                        <Edit className='h-4 w-4' />
                        Edit
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleManageInitiatives(port.port_id!)}
                        disabled={!port.port_id || isDeletingPort}
                        className='h-8 cursor-pointer hover:bg-emerald-700/10 w-[6.5rem] text-emerald-800 flex items-center'>
                        <FileText className='h-4 w-4' />
                        Initiatives
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeletePort(port.port_id!)}
                        disabled={!port.port_id || isDeletingPort}
                        className='h-8 cursor-pointer w-[5rem] hover:bg-red-700/10 text-red-800 flex items-center'>
                        {isDeletingPort && selectedPortId === port.port_id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <span className='flex items-center gap-2'>
                            <Trash2 className='h-4 w-4' />
                            Delete
                          </span>
                        )}
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
    <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8'>
      {/* Page Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            Ports Management
          </h1>
          <p className='text-muted-foreground mt-1'>
            Administer Indian and International port master data.
          </p>
        </div>

        <div className='flex space-x-3 mt-4 md:mt-0'>
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
            <div className='flex justify-center space-x-3 mt-2'>
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
          <TabsList className='grid w-full sm:w-[400px] grid-cols-2 mb-6 bg-muted p- rounded-lg'>
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
