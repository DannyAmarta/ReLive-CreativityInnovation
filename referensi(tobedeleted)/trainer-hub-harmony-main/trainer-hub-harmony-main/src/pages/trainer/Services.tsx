import { useState } from "react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { EmptyState } from "@/components/trainer/EmptyState";
import { services as initial, fmtIdr, fmtUsdc, type Service } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Edit2, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  title: string;
  description: string;
  durationMin: number;
  priceUsdc: number;
  priceIdr: number;
}

const empty: FormState = { title: "", description: "", durationMin: 60, priceUsdc: 5, priceIdr: 50000 };

export default function Services() {
  const [data, setData] = useState<Service[]>(initial);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [confirmDel, setConfirmDel] = useState<Service | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description,
      durationMin: s.durationMin,
      priceUsdc: s.priceUsdc,
      priceIdr: s.priceIdr,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error("Title and description are required");
    if (form.priceUsdc < 5) return toast.error("USDC price must be at least 5");
    if (form.priceIdr < 50000) return toast.error("IDR price must be at least 50,000");

    if (editing) {
      setData((xs) => xs.map((x) => (x.id === editing.id ? { ...editing, ...form } : x)));
      toast.success("Service updated");
    } else {
      const id = `SVC-${Math.floor(Math.random() * 9000 + 1000)}`;
      setData((xs) => [...xs, { id, ...form }]);
      toast.success("Service created");
    }
    setOpen(false);
  };

  const del = (s: Service) => {
    setData((xs) => xs.filter((x) => x.id !== s.id));
    toast.success("Service deleted");
    setConfirmDel(null);
  };

  return (
    <div>
      <PageHeader
        title="Services"
        description="Define what you offer and how clients pay — in USDC or IDR."
        action={
          <Button onClick={openNew} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="size-4 mr-1.5" /> Add Service
          </Button>
        }
      />

      {data.length === 0 ? (
        <div className="glass-card-elevated">
          <EmptyState icon={Zap} title="No services yet" description="Create your first service to start receiving bookings." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => (
            <article key={s.id} className="glass-card-elevated p-5 group hover:border-accent/40 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold tracking-tight">{s.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="size-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="Edit">
                    <Edit2 className="size-3.5" />
                  </button>
                  <button onClick={() => setConfirmDel(s)} className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground" aria-label="Delete">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{s.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {s.durationMin} min</span>
              </div>
              <div className="flex items-baseline gap-3 pt-3 border-t border-border">
                <p className="font-mono tabular-nums font-semibold text-primary">{fmtUsdc(s.priceUsdc)}</p>
                <span className="text-muted-foreground/50 text-xs">·</span>
                <p className="font-mono tabular-nums text-sm text-muted-foreground">{fmtIdr(s.priceIdr)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
            <DialogDescription>Set details and pricing in both currencies.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dur">Duration (minutes)</Label>
              <Input id="dur" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: +e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usdc">Price (USDC)</Label>
                <Input id="usdc" type="number" min={5} value={form.priceUsdc} onChange={(e) => setForm({ ...form, priceUsdc: +e.target.value })} />
                <p className="text-[10px] text-muted-foreground">Min 5</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idr">Price (IDR)</Label>
                <Input id="idr" type="number" min={50000} value={form.priceIdr} onChange={(e) => setForm({ ...form, priceIdr: +e.target.value })} />
                <p className="text-[10px] text-muted-foreground">Min 50,000</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-primary text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>{confirmDel && `"${confirmDel.title}" will no longer be bookable.`}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDel && del(confirmDel)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
