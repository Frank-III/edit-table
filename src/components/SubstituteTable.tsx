import React from 'react'

import {
  Column,
  Table,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  RowData,
  TableMeta,
} from '@tanstack/react-table'
import { Substitute } from '../makeData'

interface SubTableProps {
  subdata: Substitute[]
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void

    deleteData: (rowIndex: number) => void

    insertRowAbove: (rowIndex: number) => void

    insertRowBelow: (rowIndex: number) => void
  }
}

export const defaultColumn: Partial<ColumnDef<Substitute>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue()
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return (
      <input
        className='w-full'
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
      />
    )
  },
}

export function useSkipper() {
  const shouldSkipRef = React.useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = React.useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  React.useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}

export default function SubTable({subdata} : SubTableProps ) {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo<ColumnDef<Substitute>[]>(
    () => [
      {
        header: 'Num',
        footer: props => props.column.id,
        columns: [
          {
            accessorKey: 'nums',
            footer: props => props.column.id,
            size: 20
          },
        ],
      },
      {
        header: 'TimeStamp',
        footer: props => props.column.id,
        columns: [
          {
            accessorKey: 'timestamp',
            // header: () => 'Age',
            footer: props => props.column.id,
            size: 40
          },
            ],
          },
      {
        header: 'Content',
        footer: props => props.column.id,
        columns: [
          {
            accessorKey: 'content',
            // header: () => 'content',
            footer: props => props.column.id,
            size: 60
          },
            ],
          }
    ],
    []
  )


  const [data, setData] = React.useState<Substitute[]>(subdata)
  const refreshData = () => setData(data)

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex()
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
      deleteData: (rowIndex) => {
        skipAutoResetPageIndex()

        setData(old => [
            ...old.slice(0, rowIndex),
            ...old.slice(rowIndex+1).map(row => {row.nums -= 1; return row})
        ])
      },


      insertRowAbove: (rowIndex) => {
        skipAutoResetPageIndex()
        const new_row = {nums: rowIndex+1, timestamp: "timestamp", content: "xxx"} as Substitute
        setData(old => [
            ...old.slice(0, rowIndex),
            new_row,
            ...old.slice(rowIndex).map(row => {row.nums += 1; return row})
        ])
    },
      insertRowBelow: (rowIndex) => {
        skipAutoResetPageIndex()
        const new_row = {nums: rowIndex+2, timestamp: "timestamp", content: "xxx"} as Substitute
        setData(old => [
            ...old.slice(0, rowIndex+1),
            new_row,
            ...old.slice(rowIndex+1).map(row => {row.nums += 1; return row})
        ])
    }
  },
  debugTable: true,
  })

  return (
    <>
      <table className="w-fit-content divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup, index) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      // className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      // style: {width: index === 0 ? 8 : index == 1 ? 40 : 50}
                      style: {width: header.getSize()}
                  }}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            // console.log(row.getVisibleCells().length) #3
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td {...{
                      key: cell.id,
                      // className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-500',
                      // position: 'absolute'
                      // style: {width: index== 0 ? 16 : index == 1 ? 40 : 50},
                      style: {width: cell.column.getSize()}
                    }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
                <td>
                  <button onClick={() => table.options.meta?.deleteData(index)}>❌</button>
                  <button onClick={() => table.options.meta?.insertRowAbove(index)}>⬆️</button>
                  <button onClick={() => table.options.meta?.insertRowBelow(index)}>⬇️</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      </>
    )
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        // className={`w-${column.getSize() / 2} border shadow rounded`}
        className='w-8 border shadow rounded'
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        // className={`w-${column.getSize() / 2} border shadow rounded`}
        className='w-8 border shadow rounded'
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}

      // className="w-50 border shadow rounded"
      className={`w-${column.getSize()} border shadow rounded`}
    />
  )
}