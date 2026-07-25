import React, { useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { jobsActions } from "./jobsSlice";
import { Job } from "@/app/jobs/types";

export function useJobsPageState() {
  const dispatch = useAppDispatch();
  const items = (useAppSelector((s) => s.jobs.jobs.data) ?? []) as Job[];
  const loading = useAppSelector((s) => s.jobs.jobs.status === "loading");
  const error = useAppSelector((s) => s.jobs.jobs.error);
  const success = useAppSelector((s) => s.jobs.jobs.lastAction);

  const runs = useAppSelector((s) => s.jobs.runs.data) ?? [];
  const runsLoading = useAppSelector((s) => s.jobs.runs.status === "loading");
  const runsError = useAppSelector((s) => s.jobs.runs.error);
  const triggerSuccess = useAppSelector((s) => s.jobs.runs.lastAction);

  const jobsUi = useAppSelector((s) => s.jobs.jobs.ui);

  const { searchQuery = "", isModalOpen = false, modalMode = "create", editingId = null, formFields = {} } = jobsUi;
  const { orgId = "1", categoryId = "", name = "", status = "active", configText = "{}", configError = "", isRunsModalOpen = false, runsJob = null } = formFields;

  const fetchItems = useCallback(() => {
    dispatch(jobsActions.fetchJobsRequest());
  }, [dispatch]);

  const openModal = useCallback((item?: Job) => {
    if (item) {
      dispatch(jobsActions.openModal({
        mode: "edit",
        editingId: item.id,
        initialFields: {
          orgId: item.orgId.toString(),
          categoryId: item.categoryId?.toString() ?? "",
          name: item.name,
          status: item.status,
          configText: JSON.stringify(item.config ?? {}, null, 2),
          configError: ""
        }
      }));
    } else {
      dispatch(jobsActions.openModal({
        mode: "create",
        initialFields: { orgId: "1", categoryId: "", name: "", status: "active", configText: "{}", configError: "" }
      }));
    }
  }, [dispatch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let config: Record<string, unknown>;
    try {
      config = configText.trim() ? JSON.parse(configText) : {};
    } catch {
      dispatch(jobsActions.setFormField({ field: "configError", value: "Config must be valid JSON." }));
      return;
    }

    const parsedOrgId = parseInt(orgId, 10);
    const finalOrgId = Number.isNaN(parsedOrgId) ? 1 : parsedOrgId;

    const parsedCategoryId = parseInt(categoryId, 10);

    const payload: Omit<Job, "id"> & { categoryId?: number } = {
      orgId: finalOrgId,
      name,
      status,
      config,
      ...(!Number.isNaN(parsedCategoryId) ? { categoryId: parsedCategoryId } : {}),
    };

    if (modalMode === "create") {
      dispatch(jobsActions.createJobRequest(payload));
    } else if (modalMode === "edit" && editingId !== null) {
      dispatch(jobsActions.updateJobRequest({ id: editingId, data: payload }));
    }
  }, [dispatch, name, configText, orgId, categoryId, status, modalMode, editingId]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    dispatch(jobsActions.deleteJobRequest(id));
  }, [dispatch]);

  const openRunsModal = useCallback((job: Job) => {
    dispatch(jobsActions.setFormField({ field: "runsJob", value: job }));
    dispatch(jobsActions.setFormField({ field: "isRunsModalOpen", value: true }));
    dispatch(jobsActions.fetchRunsRequest(job.id));
  }, [dispatch]);

  const handleTriggerRun = useCallback((jobId: number) => {
    dispatch(jobsActions.triggerJobRequest(jobId));
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.status.toLowerCase().includes(q) || item.id.toString().includes(q);
    });
  }, [items, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    dispatch,
    items,
    loading,
    error,
    success,
    runs,
    runsLoading,
    runsError,
    triggerSuccess,
    jobsUi,
    searchQuery,
    isModalOpen,
    modalMode,
    editingId,
    orgId,
    categoryId,
    name,
    status,
    configText,
    configError,
    isRunsModalOpen,
    runsJob,
    fetchItems,
    openModal,
    handleSubmit,
    handleDelete,
    openRunsModal,
    handleTriggerRun,
    filteredItems,
  };
}
