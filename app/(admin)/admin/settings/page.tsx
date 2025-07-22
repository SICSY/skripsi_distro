"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
} from "lucide-react"
import { useSettings } from "@/src/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data, error, isLoading } = useSettings()
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "3D Model Configurator",
    siteDescription: "Custom 3D model design platform",
    contactEmail: "admin@example.com",
    supportPhone: "+62 123 456 7890",

    // Business Settings
    defaultPrice: 100000,
    taxRate: 10,
    currency: "IDR",

    // Email Settings
    emailEnabled: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",

    // Notification Settings
    orderNotifications: true,
    customerNotifications: true,
    lowStockAlerts: true,

    // Security Settings
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,

    // Feature Flags
    arModeEnabled: true,
    uvGuideEnabled: true,
    exportEnabled: true,
    analyticsEnabled: true,
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackup = () => {
    const backupData = {
      settings,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `settings-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Settings backup downloaded")
  }

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)
        setSettings(backupData.settings)
        toast.success("Settings restored successfully")
      } catch (error) {
        toast.error("Invalid backup file")
      }
    }
    reader.readAsText(file)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load settings</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400">Configure system settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBackup} variant="outline" className="border-zinc-600 text-zinc-300 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Backup
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription className="text-zinc-400">Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-zinc-700" />
                    <Skeleton className="h-10 w-full bg-zinc-700" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Site Description</Label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Support Phone</Label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5" />
              Business Settings
            </CardTitle>
            <CardDescription className="text-zinc-400">Pricing and business configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-zinc-700" />
                    <Skeleton className="h-10 w-full bg-zinc-700" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Default Price (Rp)</Label>
                  <Input
                    type="number"
                    value={settings.defaultPrice}
                    onChange={(e) => setSettings({ ...settings, defaultPrice: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Currency</Label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                    disabled
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="w-5 h-5" />
              Email Settings
            </CardTitle>
            <CardDescription className="text-zinc-400">SMTP configuration for email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Enable Email</Label>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
              />
            </div>
            {settings.emailEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-300">SMTP Host</Label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">SMTP Username</Label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">SMTP Password</Label>
                  <Input
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-zinc-400">Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Order Notifications</Label>
                <p className="text-sm text-zinc-400">Get notified about new orders</p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, orderNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Customer Notifications</Label>
                <p className="text-sm text-zinc-400">Send emails to customers</p>
              </div>
              <Switch
                checked={settings.customerNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, customerNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Low Stock Alerts</Label>
                <p className="text-sm text-zinc-400">Alert when products are low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription className="text-zinc-400">Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Email Verification</Label>
                <p className="text-sm text-zinc-400">Require email verification for new users</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="w-5 h-5" />
              Features
            </CardTitle>
            <CardDescription className="text-zinc-400">Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">AR Mode</Label>
                <p className="text-sm text-zinc-400">Enable augmented reality features</p>
              </div>
              <Switch
                checked={settings.arModeEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, arModeEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">UV Guide</Label>
                <p className="text-sm text-zinc-400">Show UV mapping guides</p>
              </div>
              <Switch
                checked={settings.uvGuideEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, uvGuideEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Export Features</Label>
                <p className="text-sm text-zinc-400">Allow users to export designs</p>
              </div>
              <Switch
                checked={settings.exportEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, exportEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-300">Analytics</Label>
                <p className="text-sm text-zinc-400">Enable analytics tracking</p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup & Restore */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription className="text-zinc-400">Manage system backups and data restoration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={handleBackup} variant="outline" className="border-zinc-600 text-zinc-300 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
            <div>
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" id="restore-input" />
              <Button asChild variant="outline" className="border-zinc-600 text-zinc-300 bg-transparent">
                <label htmlFor="restore-input" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Restore Backup
                </label>
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8 bg-zinc-600" />
            <Button variant="outline" className="border-red-600 text-red-400 bg-transparent hover:bg-red-600/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          <p className="text-sm text-zinc-400 mt-4">Last backup: Never • System version: 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  )
}
