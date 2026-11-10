import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  /** Numbers and amounts: right-aligned with tabular figures. */
  align?: "start" | "end";
  /** The column that names each row; rendered as a row header for screen readers. */
  isRowHeader?: boolean;
}

export interface DataTableProps<Row> {
  /** Describes the table for screen readers; shown visually unless hideCaption. */
  caption: string;
  hideCaption?: boolean;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Shown instead of the table when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

/** Semantic table that scrolls sideways on narrow screens instead of squashing. */
export function DataTable<Row>({
  caption,
  hideCaption = false,
  columns,
  rows,
  rowKey,
  empty,
  className,
}: DataTableProps<Row>) {
  if (rows.length === 0 && empty !== undefined) return <>{empty}</>;

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-line bg-surface shadow-1", className)}>
      <table className="w-full border-collapse text-left">
        <caption className={cn("px-4 pt-4 text-left type-h4 text-fg", hideCaption && "sr-only")}>
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 type-label-sm whitespace-nowrap text-fg-secondary",
                  col.align === "end" && "text-right",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-b-0">
              {columns.map((col) => {
                const Cell = col.isRowHeader ? "th" : "td";
                return (
                  <Cell
                    key={col.key}
                    {...(col.isRowHeader ? { scope: "row" } : {})}
                    className={cn(
                      "px-4 py-3 align-middle type-body text-fg",
                      col.isRowHeader && "font-medium",
                      col.align === "end" && "text-right tabular-nums",
                    )}
                  >
                    {col.cell(row)}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
