import api from "@/lib/api"
import type { Settings, UpdateSettingsDto } from "@/lib/types/settings"

export const settingsApi = {
  get: () =>
    api.get<Settings>("/settings").then(r => r.data),

  update: (dto: UpdateSettingsDto) =>
    api.patch<Settings>("/settings", dto).then(r => r.data),
}
