"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { api, type Integration, type IntegrationType } from "@/lib/api-client";
import { IntegrationFormDialog } from "@/components/settings/integration-form-dialog";

type IntegrationSelectorProps = {
  integrationType: IntegrationType;
  value?: string;
  onChange: (integrationId: string) => void;
  onOpenSettings?: () => void;
  label?: string;
  disabled?: boolean;
};

export function IntegrationSelector({
  integrationType,
  value,
  onChange,
  onOpenSettings,
  label,
  disabled,
}: IntegrationSelectorProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const all = await api.integration.getAll();
      const filtered = all.filter((i) => i.type === integrationType);
      setIntegrations(filtered);
      
      // Auto-select if only one option and nothing selected yet
      if (filtered.length === 1 && !value) {
        onChange(filtered[0].id);
      }
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [integrationType, value, onChange]);

  const handleValueChange = (newValue: string) => {
    if (newValue === "__new__") {
      setShowNewDialog(true);
    } else if (newValue === "__manage__") {
      onOpenSettings?.();
    } else {
      onChange(newValue);
    }
  };

  const handleNewIntegrationCreated = async (integrationId: string) => {
    await loadIntegrations();
    onChange(integrationId);
    setShowNewDialog(false);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2">
          <Spinner className="size-4" />
          <span className="text-muted-foreground text-sm">
            Loading integrations...
          </span>
        </div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Select disabled={disabled} onValueChange={handleValueChange} value={value}>
          <SelectTrigger className="flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-500/50 p-0.5">
                <AlertTriangle className="size-3 text-white" />
              </div>
              <SelectValue placeholder="No integrations configured" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__new__">New Integration</SelectItem>
            <SelectItem value="__manage__">Manage Integrations</SelectItem>
          </SelectContent>
        </Select>
        
        <IntegrationFormDialog
          mode="create"
          onClose={() => setShowNewDialog(false)}
          onSuccess={handleNewIntegrationCreated}
          open={showNewDialog}
          preselectedType={integrationType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select disabled={disabled} onValueChange={handleValueChange} value={value}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select integration..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__new__">New Integration</SelectItem>
          <SelectItem value="__manage__">Manage Integrations</SelectItem>
          {integrations.length > 0 && <Separator className="my-1" />}
          {integrations.map((integration) => (
            <SelectItem key={integration.id} value={integration.id}>
              {integration.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <IntegrationFormDialog
        mode="create"
        onClose={() => setShowNewDialog(false)}
        onSuccess={handleNewIntegrationCreated}
        open={showNewDialog}
        preselectedType={integrationType}
      />
    </div>
  );
}

