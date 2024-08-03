"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link'; // Adjust import if needed

export function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Helper function to determine the status color
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-red-200 text-red-800";
      case "in_review":
        return "bg-yellow-200 text-yellow-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-center bg-gray-800 text-white ${header.column.id === 'job' ? 'text-left pl-4' : ''}`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const cellContext = cell.getContext();
                  const cellValue = flexRender(cell.column.columnDef.cell, cellContext);

                  // Extract the value if it's an object
                  const value = typeof cellValue === 'object' ? cellValue?.value || cellValue : cellValue;

                  // Determine the class for the status column
                  const cellClass = cell.column.id === 'status'
                    ? getStatusColor(value)
                    : '';

                  // Apply specific styling for the job column to reduce its size
                  const cellStyle = cell.column.id === 'job'
                    ? 'text-left pl-4 w-1/4' // Adjust width here
                    : 'text-center';

                  return (
                    <TableCell
                      key={cell.id}
                      className={`${cellClass} ${cellStyle}`}
                    >
                      {cell.column.id === 'job' ? (
                        <Link href={`/job/${row.original.id}`} className="text-blue-500 hover:underline">
                          {value}
                        </Link>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
