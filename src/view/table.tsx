"use client";

import * as React from "react";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TableDataProps<T extends object> {
  data: T[];
  filterKey?: keyof T; // optional: which column to filter
}

export function TableData<T extends object>({ data, filterKey }: TableDataProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10
  });

  const keys = Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [];

  // Validasi apakah filterKey memang ada di keys
  const canFilter = filterKey && keys.includes(String(filterKey));

  const columns: ColumnDef<T>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label='Select all' />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />,
      enableSorting: false,
      enableHiding: false
    },
    ...(keys.map((key) => ({
      accessorKey: key,
      header: ({ column }) => (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {key}
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => <div className='capitalize'>{String(row.getValue(key))}</div>
    })) as ColumnDef<T>[])
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection
  });

  if (!Array.isArray(data) || data.length === 0) {
    return <div className='p-4 text-muted-foreground'>Tidak ada data.</div>;
  }

  return (
    <div className='w-full'>
      <div className='flex items-center gap-2 py-4'>
        {canFilter && (
          <Input
            placeholder={`Filter ${String(filterKey)}...`}
            value={(table.getColumn(String(filterKey))?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(String(filterKey))?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem key={column.id} className='capitalize' checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-4 py-4'>
        {/* Selected info */}
        <div className='text-muted-foreground text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {/* Page size selector */}
        <div className='flex items-center gap-2'>
          <label htmlFor='rowsPerPage' className='text-sm text-muted-foreground'>
            Rows per page:
          </label>
          <select id='rowsPerPage' className='border rounded px-2 py-1 text-sm' value={pagination.pageSize} onChange={(e) => setPagination({ ...pagination, pageSize: Number(e.target.value) })}>
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <span className='text-sm text-muted-foreground'>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        {/* Pagination controls */}
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
