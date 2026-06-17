# App-Owned Data Grid

In this repo, table visuals should be implemented with app-owned React components. Use `@tanstack/react-table` as the headless engine and render the DOM, styling, menus, and interactions yourself.

### Table Architecture

- Use `DataTable` or a mapped row model as the input contract.
- Convert query results into row objects in `src/lib/` helpers.
- Define columns in the component or a local table config module.
- Render headers, filters, menus, and cells explicitly in JSX.

### Theming

Use the app tokens in `src/global.css` for light/dark support. Unlike the old `DataGrid`, TanStack Table does not take a `theme` prop; you style the table directly with Tailwind classes and CSS variables.

```tsx
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

const table = useReactTable({
  data: rows,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

### Custom Cell Rendering

**Key behaviors:**
- TanStack cell renderers receive row and column context, so formatting is fully explicit.
- Tooltips, truncation, sticky columns, and expanded rows are app responsibilities.
- Column IDs should stay stable so sorting/filter/visibility state remains predictable.

#### Examples

**Data bar** — visualize a numeric value as a progress bar, scaled to the column's maximum:

```tsx
{
  id: "revenue",
  header: "Revenue",
  cell: ({ getValue }) => {
    const value = getValue();
    const maxValue = 100000; // set to the column's known maximum
    const num = typeof value === "number" ? value : 0;
    const pct = Math.min((num / maxValue) * 100, 100);
    return (
      <div className="flex items-center gap-s">
        <div className="h-s w-full rounded-full bg-muted">
          <div
            className="h-s rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-200 tabular-nums">{num}</span>
      </div>
    );
  },
}
```

**Combining row fields** — use the second `row` parameter to build content from multiple columns:

```tsx
{
  id: "name",
  header: "Employee",
  cell: ({ row, getValue }) => {
    const name = String(getValue() ?? "");
    const role = String(row.original.role ?? "");
    return (
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{name}</span>
        <span className="text-200 text-muted-foreground">{role}</span>
      </div>
    );
  },
}
```

**Boolean indicator** — render a check/cross icon instead of "true"/"false":

```tsx
import { Check, X } from "lucide-react";

{
  id: "verified",
  header: "Verified",
  cell: ({ getValue }) =>
    getValue() ? 
    value ? <Check className="icon-size-200 text-green-600" /> : <X className="icon-size-200 text-red-500" />,
}
```

**Clickable URL** — use when the column value is a URL the user should navigate to (e.g. a reference link, document, or external page). Renders as clickable text:

```tsx
{
  id: "website",
  header: "Website",
  cell: ({ getValue }) => {
    const href = typeof getValue() === "string" ? getValue() : "";
    return href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-foreground underline">
        {href}
      </a>
    ) : null;
  },
}
```

**Image cell** — use when the column value is a URL pointing to an image meant for visual display (e.g. a photo, avatar, or product image). Render your own thumbnail and optional lightbox:

```tsx
{
  id: "photo",
  header: "Photo",
  cell: ({ getValue }) => {
    const src = typeof getValue() === "string" ? getValue() : "";
    return src ? <img src={src} alt="Photo" className="h-10 w-10 rounded-md object-cover" /> : null;
  },
}
```

**Cell tooltip** — wrap the rendered content in your own tooltip/popup component when needed:

```tsx
{
  id: "name",
  header: "Name",
  cell: ({ row, getValue }) => {
    const name = String(getValue() ?? "");
    const detail = String(row.original.email ?? "");
    return (
      <div title={`${name} · ${detail}`}>
        <span>{name}</span>
      </div>
    );
  },
}
```
