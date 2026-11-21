import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { FarmsSkeleton } from "../components/common/Skeleton";
import { Modal } from "../components/common/Modal";
import { PageHeader } from "../components/common/PageHeader";
import { useToast } from "../contexts/ToastContext";
import {
  createFarm,
  createPlot,
  deleteFarm,
  deletePlot,
  extractErrorMessage,
  listFarms,
  listPlots,
  updateFarm,
  updatePlot,
} from "../services/api";
import type { Farm, Plot } from "../types";

const farmSchema = z.object({
  name: z.string().min(2, "Ingrese el nombre"),
  department: z.string().min(2, "Ingrese el departamento"),
  municipality: z.string().min(2, "Ingrese el municipio"),
  location: z.string().min(2, "Ingrese la ubicación"),
  area_hectares: z.coerce.number().min(0, "Debe ser 0 o más"),
  description: z.string().optional(),
});

const plotSchema = z.object({
  farm_id: z.coerce.number().min(1, "Seleccione una finca"),
  name: z.string().min(2, "Ingrese el nombre"),
  coffee_variety: z.string().optional(),
  area_hectares: z.coerce.number().min(0).optional().or(z.literal("")),
  altitude: z.coerce.number().min(0).optional().or(z.literal("")),
  observations: z.string().optional(),
});

type FarmForm = z.infer<typeof farmSchema>;
type PlotForm = z.infer<typeof plotSchema>;

export function FarmsPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmModal, setFarmModal] = useState(false);
  const [plotModal, setPlotModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "farm" | "plot"; id: number; name: string } | null>(
    null,
  );

  const farmForm = useForm<FarmForm>({ resolver: zodResolver(farmSchema) });
  const plotForm = useForm<PlotForm>({ resolver: zodResolver(plotSchema) });

  const reload = async () => {
    const [farmData, plotData] = await Promise.all([listFarms(), listPlots()]);
    setFarms(farmData);
    setPlots(plotData);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await reload();
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudieron cargar fincas y parcelas."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [notify]);

  const openCreateFarm = () => {
    setEditingFarm(null);
    farmForm.reset({
      name: "",
      department: "",
      municipality: "",
      location: "",
      area_hectares: 0,
      description: "",
    });
    setFarmModal(true);
  };

  const openEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    farmForm.reset({
      name: farm.name,
      department: farm.department,
      municipality: farm.municipality,
      location: farm.location,
      area_hectares: farm.area_hectares,
      description: farm.description || "",
    });
    setFarmModal(true);
  };

  const openCreatePlot = () => {
    setEditingPlot(null);
    plotForm.reset({
      farm_id: farms[0]?.id || 0,
      name: "",
      coffee_variety: "",
      area_hectares: "",
      altitude: "",
      observations: "",
    });
    setPlotModal(true);
  };

  const openEditPlot = (plot: Plot) => {
    setEditingPlot(plot);
    plotForm.reset({
      farm_id: plot.farm_id,
      name: plot.name,
      coffee_variety: plot.coffee_variety || "",
      area_hectares: plot.area_hectares ?? "",
      altitude: plot.altitude ?? "",
      observations: plot.observations || "",
    });
    setPlotModal(true);
  };

  const onSubmitFarm = farmForm.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        description: values.description?.trim() ? values.description : null,
      };
      if (editingFarm) {
        await updateFarm(editingFarm.id, payload);
        notify("Finca actualizada.", "success");
      } else {
        await createFarm(payload);
        notify("Finca registrada.", "success");
      }
      setFarmModal(false);
      await reload();
    } catch (error) {
      notify(extractErrorMessage(error), "error");
    }
  });

  const onSubmitPlot = plotForm.handleSubmit(async (values) => {
    try {
      const payload = {
        farm_id: values.farm_id,
        name: values.name,
        coffee_variety: values.coffee_variety?.trim() ? values.coffee_variety : null,
        area_hectares:
          values.area_hectares === "" || values.area_hectares === undefined
            ? null
            : Number(values.area_hectares),
        altitude:
          values.altitude === "" || values.altitude === undefined ? null : Number(values.altitude),
        observations: values.observations?.trim() ? values.observations : null,
      };
      if (editingPlot) {
        await updatePlot(editingPlot.id, payload);
        notify("Parcela actualizada.", "success");
      } else {
        await createPlot(payload);
        notify("Parcela registrada.", "success");
      }
      setPlotModal(false);
      await reload();
    } catch (error) {
      notify(extractErrorMessage(error), "error");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "farm") await deleteFarm(deleteTarget.id);
      else await deletePlot(deleteTarget.id);
      notify("Registro eliminado.", "success");
      setDeleteTarget(null);
      await reload();
    } catch (error) {
      notify(extractErrorMessage(error), "error");
    }
  };

  if (loading) return <FarmsSkeleton />;

  return (
    <div>
      <PageHeader
        title="Fincas y parcelas"
        subtitle="Organiza tus cultivos para asociar cada inspección a un sector concreto."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={openCreateFarm}>
              <Plus className="h-4 w-4" />
              Nueva finca
            </button>
            <button type="button" className="btn-primary" onClick={openCreatePlot} disabled={farms.length === 0}>
              <Plus className="h-4 w-4" />
              Nueva parcela
            </button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card-surface">
          <h3 className="mb-5 font-display text-[26px] tracking-tight text-ink">Fincas</h3>
          {farms.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title="Sin fincas registradas"
              description="Registra tu primera finca cafetalera para comenzar el monitoreo."
              action={
                <button type="button" className="btn-primary" onClick={openCreateFarm}>
                  Registrar finca
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {farms.map((farm) => (
                <article key={farm.id} className="rounded-elevated bg-paper p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[18px] text-ink">{farm.name}</h4>
                      <p className="mt-1 text-[15px] text-slate">
                        {farm.municipality}, {farm.department}
                      </p>
                      <p className="mt-1 text-[14px] text-ash">
                        {farm.location} · {farm.area_hectares} ha
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="rounded-pill p-2 text-slate hover:bg-mist hover:text-ink" onClick={() => openEditFarm(farm)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-pill p-2 text-slate hover:bg-mist hover:text-sienna"
                        onClick={() => setDeleteTarget({ type: "farm", id: farm.id, name: farm.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card-surface">
          <h3 className="mb-5 font-display text-[26px] tracking-tight text-ink">Parcelas</h3>
          {plots.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title="Sin parcelas"
              description="Cada finca puede dividirse en sectores o parcelas de cultivo."
            />
          ) : (
            <div className="space-y-3">
              {plots.map((plot) => (
                <article key={plot.id} className="rounded-elevated bg-paper p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[18px] text-ink">{plot.name}</h4>
                      <p className="mt-1 text-[15px] text-slate">{plot.farm_name}</p>
                      <p className="mt-1 text-[14px] text-ash">
                        {plot.coffee_variety || "Variedad no indicada"}
                        {plot.altitude ? ` · ${plot.altitude} m s. n. m.` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="rounded-pill p-2 text-slate hover:bg-mist hover:text-ink" onClick={() => openEditPlot(plot)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-pill p-2 text-slate hover:bg-mist hover:text-sienna"
                        onClick={() => setDeleteTarget({ type: "plot", id: plot.id, name: plot.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={farmModal}
        title={editingFarm ? "Editar finca" : "Registrar finca"}
        onClose={() => setFarmModal(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setFarmModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={onSubmitFarm}>
              Guardar
            </button>
          </>
        }
      >
        <form className="grid gap-3" onSubmit={onSubmitFarm}>
          <div>
            <label className="label-field">Nombre</label>
            <input className="input-field" {...farmForm.register("name")} />
            <p className="mt-1 text-xs text-sienna">{farmForm.formState.errors.name?.message}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-field">Departamento</label>
              <input className="input-field" {...farmForm.register("department")} />
            </div>
            <div>
              <label className="label-field">Municipio</label>
              <input className="input-field" {...farmForm.register("municipality")} />
            </div>
          </div>
          <div>
            <label className="label-field">Comunidad o ubicación</label>
            <input className="input-field" {...farmForm.register("location")} />
          </div>
          <div>
            <label className="label-field">Hectáreas aproximadas</label>
            <input type="number" step="0.01" className="input-field" {...farmForm.register("area_hectares")} />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <textarea className="input-field min-h-20" {...farmForm.register("description")} />
          </div>
        </form>
      </Modal>

      <Modal
        open={plotModal}
        title={editingPlot ? "Editar parcela" : "Registrar parcela"}
        onClose={() => setPlotModal(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setPlotModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={onSubmitPlot}>
              Guardar
            </button>
          </>
        }
      >
        <form className="grid gap-3" onSubmit={onSubmitPlot}>
          <div>
            <label className="label-field">Finca</label>
            <select className="input-field" {...plotForm.register("farm_id")}>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Nombre de parcela</label>
            <input className="input-field" {...plotForm.register("name")} />
          </div>
          <div>
            <label className="label-field">Variedad de café</label>
            <input className="input-field" {...plotForm.register("coffee_variety")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-field">Área (ha)</label>
              <input type="number" step="0.01" className="input-field" {...plotForm.register("area_hectares")} />
            </div>
            <div>
              <label className="label-field">Altitud</label>
              <input type="number" step="1" className="input-field" {...plotForm.register("altitude")} />
            </div>
          </div>
          <div>
            <label className="label-field">Observaciones</label>
            <textarea className="input-field min-h-20" {...plotForm.register("observations")} />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Confirmar eliminación"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={confirmDelete}>
              Eliminar
            </button>
          </>
        }
      >
        <p className="text-sm text-slate">
          ¿Eliminar {deleteTarget?.type === "farm" ? "la finca" : "la parcela"}{" "}
          <strong>{deleteTarget?.name}</strong>? Esta acción también puede eliminar inspecciones asociadas.
        </p>
      </Modal>
    </div>
  );
}
