import React, { useState, useRef } from 'react';
import { Plan, ClubInfo } from '../types';
import { StorageService } from '../services/storageService';
import { Settings, Plus, Edit2, Trash2, DollarSign, Check, Award, Save, Camera, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Logo } from './Logo';

interface PlansModuleProps {
  plans: Plan[];
  clubInfo: ClubInfo;
  onPlansUpdated: () => void;
  onClubInfoUpdated: (info: ClubInfo) => void;
}

export const PlansModule: React.FC<PlansModuleProps> = ({
  plans,
  clubInfo,
  onPlansUpdated,
  onClubInfoUpdated,
}) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editWeeklyClasses, setEditWeeklyClasses] = useState<number>(1);

  const [enrollmentFee, setEnrollmentFee] = useState(clubInfo.enrollment_fee);
  const [isSavedFee, setIsSavedFee] = useState(false);

  // Logo state
  const [logoInputUrl, setLogoInputUrl] = useState(clubInfo.logo_url || '');
  const [isSavedLogo, setIsSavedLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Plan form state
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(60000);
  const [newWeeklyClasses, setNewWeeklyClasses] = useState<number>(1);

  const startEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
    setEditPrice(plan.price);
    setEditWeeklyClasses(plan.weekly_classes);
  };

  const handleSaveEdit = async (plan: Plan) => {
    await StorageService.updatePlan({
      ...plan,
      name: editName,
      price: Number(editPrice),
      weekly_classes: Number(editWeeklyClasses),
    });
    setEditingPlanId(null);
    onPlansUpdated();
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('¿Desea eliminar este plan de entrenamiento?')) {
      await StorageService.deletePlan(planId);
      onPlansUpdated();
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await StorageService.addPlan({
      name: newName,
      price: Number(newPrice),
      weekly_classes: Number(newWeeklyClasses),
    });

    setNewName('');
    setIsAddingPlan(false);
    onPlansUpdated();
  };

  const handleSaveEnrollmentFee = async () => {
    const updatedInfo = { ...clubInfo, enrollment_fee: Number(enrollmentFee) };
    await StorageService.saveClubInfo(updatedInfo);
    onClubInfoUpdated(updatedInfo);
    setIsSavedFee(true);
    setTimeout(() => setIsSavedFee(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado pesada. Seleccione un archivo de imagen menor a 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const resultData = reader.result;
          setLogoInputUrl(resultData);
          saveLogoToStorage(resultData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveLogoToStorage = (url: string) => {
    const updatedInfo = { ...clubInfo, logo_url: url || undefined };
    StorageService.saveClubInfo(updatedInfo);
    onClubInfoUpdated(updatedInfo);
    setIsSavedLogo(true);
    setTimeout(() => setIsSavedLogo(false), 2500);
  };

  const handleSaveUrlLogo = () => {
    saveLogoToStorage(logoInputUrl);
  };

  const handleResetLogo = () => {
    if (confirm('¿Desea volver al logo prediseñado del club?')) {
      setLogoInputUrl('');
      saveLogoToStorage('');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border-b-4 border-amber-500/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            Configuración del Club
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Planes, Tarifas y Matrículas ⚙️
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 font-medium">
            Modifique fácilmente los precios de las mensualidades y valor de la inscripción para que se actualicen en el formulario de los padres.
          </p>
        </div>

        <button
          onClick={() => setIsAddingPlan(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Crear Nuevo Plan</span>
        </button>
      </div>

      {/* DERECHO DE INSCRIPCIÓN GENERAL */}
      <div className="bg-white p-6 rounded-3xl border-2 border-yellow-300 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 text-red-900 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-red-900">
              Valor de la Matrícula / Inscripción Única
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              Valor cobrado por primera vez a los nuevos alumnos para registro y carné.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-500">$</span>
            <input
              type="number"
              value={enrollmentFee}
              onChange={(e) => setEnrollmentFee(Number(e.target.value))}
              className="w-full pl-8 pr-12 py-3 bg-stone-50 border-2 border-stone-300 rounded-xl text-lg font-black text-red-900 focus:outline-none focus:border-red-600"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">COP</span>
          </div>

          <button
            onClick={handleSaveEnrollmentFee}
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow"
          >
            <Save className="w-4 h-4 text-yellow-300" />
            <span>Guardar Valor Matrícula</span>
          </button>

          {isSavedFee && (
            <span className="text-emerald-700 font-bold text-sm flex items-center gap-1 animate-pulse">
              <Check className="w-4 h-4" /> ¡Guardado!
            </span>
          )}
        </div>
      </div>

      {/* CAMBIAR LOGO DEL CLUB */}
      <div className="bg-white p-6 rounded-3xl border-2 border-red-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-900 rounded-2xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-red-900">
                Logo e Imagen Oficial del Club
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Suba el escudo o logo de su escuela de patinaje para personalizar el encabezado y los documentos.
              </p>
            </div>
          </div>

          {clubInfo.logo_url && (
            <button
              onClick={handleResetLogo}
              className="text-stone-600 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Logo Prediseñado
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Logo Preview */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-stone-500 uppercase">Vista Previa</span>
            <div className="p-3 bg-stone-100 border-2 border-dashed border-stone-300 rounded-2xl flex items-center justify-center">
              <Logo size="xl" logoUrl={clubInfo.logo_url} />
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Subir foto o archivo de imagen desde el celular / computador:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="w-5 h-5 text-yellow-300" />
                <span>Seleccionar y Subir Foto de Logo...</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                O pegar enlace de imagen web (URL):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  placeholder="https://ejemplo.com/logo-club.png"
                  className="flex-1 bg-stone-50 border-2 border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={handleSaveUrlLogo}
                  className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2 px-4 rounded-xl text-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>Guardar URL</span>
                </button>
              </div>
            </div>

            {isSavedLogo && (
              <p className="text-emerald-700 font-bold text-sm flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" /> ¡Foto de logo actualizada exitosamente!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ADD NEW PLAN MODAL / FORM */}
      {isAddingPlan && (
        <form onSubmit={handleAddPlan} className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-400 shadow-md space-y-4">
          <h3 className="text-lg font-extrabold text-[#1E3A5F]">Crear Nuevo Plan de Entrenamiento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Nombre del Plan *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. 4 veces a la semana"
                required
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Clases por semana *</label>
              <input
                type="number"
                value={newWeeklyClasses}
                onChange={(e) => setNewWeeklyClasses(Number(e.target.value))}
                min={1}
                required
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Precio Mensual ($ COP) *</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                required
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-black text-emerald-800"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingPlan(false)}
              className="bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#1E3A5F] text-white font-black py-2.5 px-6 rounded-xl text-xs shadow"
            >
              Guardar Plan
            </button>
          </div>
        </form>
      )}

      {/* PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditing = editingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Nombre:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border-2 border-stone-300 rounded-xl p-2 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Precio ($ COP):</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full border-2 border-stone-300 rounded-xl p-2 text-base font-black text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Clases semanales:</label>
                    <input
                      type="number"
                      value={editWeeklyClasses}
                      onChange={(e) => setEditWeeklyClasses(Number(e.target.value))}
                      className="w-full border-2 border-stone-300 rounded-xl p-2 text-sm font-bold"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSaveEdit(plan)}
                      className="flex-1 bg-emerald-600 text-white font-extrabold py-2 rounded-xl text-xs"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingPlanId(null)}
                      className="bg-stone-200 text-stone-700 font-bold py-2 px-3 rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase">
                        {plan.weekly_classes} {plan.weekly_classes === 1 ? 'Clase/semana' : 'Clases/semana'}
                      </span>
                      <button
                        onClick={() => startEdit(plan)}
                        className="text-stone-400 hover:text-[#1E3A5F] p-1 rounded-lg"
                        title="Editar plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-2xl font-black text-[#1E3A5F] mt-1">
                      {plan.name}
                    </h3>

                    <div className="text-3xl font-black text-emerald-700 mt-3">
                      ${plan.price.toLocaleString('es-CO')} <span className="text-xs text-stone-500 font-normal">COP/mes</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
                    <span>Configurado para Fire Wheels</span>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
