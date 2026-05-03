import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDraft, useServiceList, useSubmitChange } from '../features/change-request/hooks';
import { changeRequestSchema, CHANGE_TYPES, type ChangeRequestFormValues } from '../features/change-request/schema';

type SaveMode = 'draft' | 'submit';

const CHANGE_TYPE_DESCRIPTIONS: Record<string, string> = {
  ENDPOINT_REMOVAL: 'Removing one or more existing API endpoints',
  CONTRACT_CHANGE: 'Modifying existing request/response schemas',
  SCHEMA_UPDATE: 'Database or data model schema changes',
  VERSION_BUMP: 'Incrementing the service version number',
  DEPENDENCY_REMOVAL: 'Removing a dependency on another service',
  DEPENDENCY_ADDITION: 'Adding a dependency on another service',
};

export default function CreateChangeRequestPage() {
  const navigate = useNavigate();
  const [saveMode, setSaveMode] = useState<SaveMode>('draft');
  const [serverError, setServerError] = useState('');

  const { data: services = [] } = useServiceList();
  const createDraft = useCreateDraft();
  const submitChange = useSubmitChange();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangeRequestFormValues>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      targetServiceId: '',
      changeType: undefined,
      affectedEndpoints: '',
      versionChange: '',
    },
  });

  const selectedChangeType = watch('changeType');

  const onSubmit = async (data: ChangeRequestFormValues) => {
    setServerError('');
    try {
      const draft = await createDraft.mutateAsync(data);

      if (saveMode === 'submit') {
        await submitChange.mutateAsync(draft.id);
      }

      navigate(`/changes/${draft.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setServerError(
        e.response?.data?.error?.message ?? 'An error occurred. Please try again.'
      );
    }
  };

  const isLoading = isSubmitting || createDraft.isPending || submitChange.isPending;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">New Change Request</h1>
        <p className="text-gray-500 text-sm mt-1">
          Propose a change to a microservice and submit it for impact analysis and review.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Basic Info */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-surface-600 pb-3">
            Change Details
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="input"
              placeholder="e.g. Deprecate /v1/auth/token endpoint"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Target Service */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Target Service <span className="text-red-500">*</span>
            </label>
            {services.length > 0 ? (
              <select {...register('targetServiceId')} className="input">
                <option value="">— Select a service —</option>
                {services.map((svc: { id: string; name: string }) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register('targetServiceId')}
                className="input"
                placeholder="auth-service"
              />
            )}
            {errors.targetServiceId && (
              <p className="text-red-400 text-xs mt-1">{errors.targetServiceId.message}</p>
            )}
          </div>

          {/* Change Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Change Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CHANGE_TYPES.map((type) => {
                const isSelected = selectedChangeType === type;
                return (
                  <label
                    key={type}
                    className={`relative flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/50 ring-1 ring-brand-500/30'
                        : 'bg-surface-700 border-surface-500 hover:border-surface-400'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('changeType')}
                      value={type}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-200">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {CHANGE_TYPE_DESCRIPTIONS[type]}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.changeType && (
              <p className="text-red-400 text-xs mt-1">{errors.changeType.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input resize-none"
              placeholder="Describe the change, its business reason, and expected impact..."
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Section: Technical Details */}
        <div className="card space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-surface-600 pb-3">
            Technical Details <span className="text-gray-600 font-normal normal-case">(optional)</span>
          </h2>

          {/* Affected Endpoints */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Affected Endpoints
            </label>
            <textarea
              {...register('affectedEndpoints')}
              rows={3}
              className="input resize-none font-mono text-sm"
              placeholder={`POST /api/auth/token\nGET  /api/auth/refresh`}
            />
            <p className="text-xs text-gray-600 mt-1">
              List affected endpoints, one per line.
            </p>
          </div>

          {/* Version Change */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Version Change
            </label>
            <input
              {...register('versionChange')}
              className="input font-mono"
              placeholder="e.g. 2.1.0 → 3.0.0"
            />
          </div>
        </div>

        {/* Error */}
        {serverError && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => setSaveMode('draft')}
            className="btn-secondary"
          >
            {isLoading && saveMode === 'draft' ? 'Saving...' : '💾 Save as Draft'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => setSaveMode('submit')}
            className="btn-primary"
          >
            {isLoading && saveMode === 'submit' ? 'Submitting...' : '🚀 Save & Submit for Review'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
