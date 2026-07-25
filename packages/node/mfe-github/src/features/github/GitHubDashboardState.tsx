import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { githubActions } from "./githubSlice";
import { ActionTemplate } from "@/app/github/types";

export function useGitHubDashboardState() {
  const dispatch = useAppDispatch();

  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [yamlTemplate, setYamlTemplate] = useState<ActionTemplate | null>(null);

  const templatesState = useAppSelector((state) => state.github.templates.items);
  const repoInfoState = useAppSelector((state) => state.github.repoInfo);
  const runsState = useAppSelector((state) => state.github.runs);
  const operationsState = useAppSelector((state) => state.github.operations);

  useEffect(() => {
    const stored = localStorage.getItem("piq_github_target");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOwner(parsed.owner || "");
        setRepo(parsed.repo || "");
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("piq_github_target", JSON.stringify({ owner, repo }));
  }, [owner, repo]);

  const fetchTemplates = useCallback(() => {
    dispatch(githubActions.templates.fetchRequest(undefined));
  }, [dispatch]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const deployStatus = operationsState.deploy.status;
  const deployData = operationsState.deploy.data;
  useEffect(() => {
    if (deployStatus === 'succeeded' && deployData) {
      setBusyId(null);
    } else if (deployStatus === 'failed') {
      setBusyId(null);
    }
  }, [deployStatus, deployData]);

  const dispatchStatus = operationsState.dispatch.status;
  const dispatchData = operationsState.dispatch.data;
  useEffect(() => {
    if (dispatchStatus === 'succeeded' && dispatchData) {
      setBusyId(null);
    } else if (dispatchStatus === 'failed') {
      setBusyId(null);
    }
  }, [dispatchStatus, dispatchData]);

  const templates = useMemo(() => Array.isArray(templatesState.data) ? templatesState.data : [], [templatesState.data]);
  const loading = templatesState.status === 'loading';
  const error = templatesState.error || operationsState.dispatch.error || operationsState.deploy.error;

  const success = useMemo(() => {
    if (operationsState.dispatch.status === 'succeeded' && operationsState.dispatch.data) return "Triggered successfully";
    if (operationsState.deploy.status === 'succeeded' && operationsState.deploy.data) return "Deployed successfully";
    return "";
  }, [operationsState.dispatch.status, operationsState.dispatch.data, operationsState.deploy.status, operationsState.deploy.data]);

  const categories = useMemo(() => {
    return Array.from(new Set(templates.map((t: any) => t.category))).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t: any) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.eventType.toLowerCase().includes(q);
    });
  }, [templates, categoryFilter, query]);

  const anyMockResult = operationsState.deploy.data?.result.mock === true;

  const handleLookupRepo = useCallback(() => {
    if (!owner || !repo) return;
    dispatch(githubActions.repo.fetchRequest({ owner, repo }));
  }, [dispatch, owner, repo]);

  const handleRefreshRuns = useCallback(() => {
    if (!owner || !repo) return;
    dispatch(githubActions.runs.fetchRequest({ owner, repo }));
  }, [dispatch, owner, repo]);

  const handleDeploy = useCallback((template: ActionTemplate) => {
    if (!owner || !repo) return;
    setBusyId(template.id);
    dispatch(githubActions.operations.deployRequest({ owner, repo, template }));
  }, [dispatch, owner, repo]);

  const handleTrigger = useCallback((template: ActionTemplate) => {
    if (!owner || !repo) return;
    setBusyId(template.id);
    dispatch(githubActions.operations.dispatchRequest({ owner, repo, eventType: template.eventType, templateId: template.id }));
  }, [dispatch, owner, repo]);

  return {
    dispatch,
    owner,
    setOwner,
    repo,
    setRepo,
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    busyId,
    setBusyId,
    yamlTemplate,
    setYamlTemplate,
    templatesState,
    repoInfoState,
    runsState,
    operationsState,
    templates,
    loading,
    error,
    success,
    categories,
    filteredTemplates,
    anyMockResult,
    handleLookupRepo,
    handleRefreshRuns,
    handleDeploy,
    handleTrigger,
  };
}
