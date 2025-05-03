// Import required dependencies
import * as React from "react"
import { cn } from "@/lib/utils"

// Table root component with forwarded ref
/**
 * Table component with a container div and a table element.
 * 
 * @param {React.HTMLAttributes<HTMLTableElement>} props - Props for the table element.
 * @param {React.Ref<HTMLTableElement>} ref - Ref for the table element.
 * @returns {JSX.Element} The table component.
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div
    // Container div for the table element
    data-slot="table-container"
    className="relative w-full overflow-x-auto"
  >
    <table
      // Table element with forwarded ref
      ref={ref}
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// Table Header component with forwarded ref
/**
 * Table header component with a thead element.
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the thead element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Ref for the thead element.
 * @returns {JSX.Element} The table header component.
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    // Thead element with forwarded ref
    ref={ref}
    data-slot="table-header"
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

// Table Body component with forwarded ref
/**
 * Table body component with a tbody element.
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the tbody element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Ref for the tbody element.
 * @returns {JSX.Element} The table body component.
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    // Tbody element with forwarded ref
    ref={ref}
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// Table Footer component with forwarded ref
/**
 * Table footer component with a tfoot element.
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the tfoot element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Ref for the tfoot element.
 * @returns {JSX.Element} The table footer component.
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    // Tfoot element with forwarded ref
    ref={ref}
    data-slot="table-footer"
    className={cn(
      "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// Table Row component with forwarded ref
/**
 * Table row component with a tr element.
 * 
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - Props for the tr element.
 * @param {React.Ref<HTMLTableRowElement>} ref - Ref for the tr element.
 * @returns {JSX.Element} The table row component.
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    // Tr element with forwarded ref
    ref={ref}
    data-slot="table-row"
    className={cn(
      "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// Table Head component with forwarded ref
/**
 * Table head component with a th element.
 * 
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - Props for the th element.
 * @param {React.Ref<HTMLTableCellElement>} ref - Ref for the th element.
 * @returns {JSX.Element} The table head component.
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    // Th element with forwarded ref
    ref={ref}
    data-slot="table-head"
    className={cn(
      "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// Table Cell component with forwarded ref
/**
 * Table cell component with a td element.
 * 
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - Props for the td element.
 * @param {React.Ref<HTMLTableCellElement>} ref - Ref for the td element.
 * @returns {JSX.Element} The table cell component.
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    // Td element with forwarded ref
    ref={ref}
    data-slot="table-cell"
    className={cn(
      "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// Table Caption component with forwarded ref
/**
 * Table caption component with a caption element.
 * 
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - Props for the caption element.
 * @param {React.Ref<HTMLTableCaptionElement>} ref - Ref for the caption element.
 * @returns {JSX.Element} The table caption component.
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    // Caption element with forwarded ref
    ref={ref}
    data-slot="table-caption"
    className={cn("text-muted-foreground mt-4 text-sm", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Export all table components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
