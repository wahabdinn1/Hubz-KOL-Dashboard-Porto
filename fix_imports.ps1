$mappings = @{
    "@/components/add-kol-dialog" = "@/components/kols/add-kol-dialog"
    "@/components/edit-kol-dialog" = "@/components/kols/edit-kol-dialog"
    "@/components/delete-kol-dialog" = "@/components/kols/delete-kol-dialog"
    "@/components/kol-table" = "@/components/kols/kol-table"
    "@/components/kol-profile-dialog" = "@/components/kols/kol-profile-dialog"
    "@/components/kol-performance-chart" = "@/components/kols/kol-performance-chart"
    "@/components/activity-log" = "@/components/kols/activity-log"
    "@/components/bulk-import-dialog" = "@/components/kols/bulk-import-dialog"

    "@/components/create-campaign-dialog" = "@/components/campaigns/create-campaign-dialog"
    "@/components/edit-campaign-dialog" = "@/components/campaigns/edit-campaign-dialog"
    "@/components/delete-campaign-dialog" = "@/components/campaigns/delete-campaign-dialog"
    "@/components/campaign-calendar" = "@/components/campaigns/campaign-calendar"
    "@/components/campaign-report" = "@/components/campaigns/campaign-report"
    "@/components/edit-deliverable-dialog" = "@/components/campaigns/edit-deliverable-dialog"
    "@/components/compare-tool-dialog" = "@/components/campaigns/compare-tool-dialog"

    "@/components/dashboard-shell" = "@/components/layout/dashboard-shell"
    "@/components/mobile-bottom-nav" = "@/components/layout/mobile-bottom-nav"
    "@/components/mode-toggle" = "@/components/layout/mode-toggle"
    "@/components/command-palette" = "@/components/layout/command-palette"

    "@/components/network-status" = "@/components/shared/network-status"
    "@/components/error-boundary" = "@/components/shared/error-boundary"
    "@/components/seed-data-button" = "@/components/shared/seed-data-button"
}

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    foreach ($key in $mappings.Keys) {
        $content = $content.Replace("from `"$key`"", "from `"$($mappings[$key])`"")
        $content = $content.Replace("from '$key'", "from '$($mappings[$key])'")
    }

    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Fixed imports in: $($file.Name)"
    }
}
