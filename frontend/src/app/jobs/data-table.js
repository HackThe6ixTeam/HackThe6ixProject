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
      default:
        return "bg-gray-200 text-gray-800"; // Fallback for unknown status
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                  const value = flexRender(cell.column.columnDef.cell, cell.getContext());
                  const cellClass = cell.column.id === 'status' 
                    ? getStatusColor(value) 
                    : cell.column.id === 'type' 
                    ? `bg-green-200 text-green-800` 
                    : '';

                  return (
                    <TableCell
                      key={cell.id}
                      className={cellClass}
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
