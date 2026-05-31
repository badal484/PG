import { Button, CurrencyInput, FileUpload, Select } from "@/components/ui";

export function ExpenseForm({ propertyName = "Auto-selected property" }: { propertyName?: string }) {
  return (
    <form className="rounded-sm border border-border bg-surface p-5 shadow-sm">
      <CurrencyInput label="Expense amount" placeholder="0" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Category<Select defaultValue="MAINTENANCE"><option value="MAINTENANCE">Maintenance</option><option value="KITCHEN_FOOD">Kitchen food</option><option value="UTILITIES_ELECTRICITY">Electricity</option></Select></label>
        <div className="grid gap-2 text-sm font-medium"><span>Property</span><span className="rounded-sm border border-border bg-slate-50 px-3 py-3">{propertyName}</span></div>
      </div>
      <div className="mt-4"><FileUpload label="Attach receipt photo" /></div>
      <Button className="mt-5 w-full">Save expense</Button>
    </form>
  );
}
