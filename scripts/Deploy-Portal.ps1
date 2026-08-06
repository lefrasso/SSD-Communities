[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [string]$AppCatalogUrl,

    [ValidateSet('Tenant', 'Site')]
    [string]$AppCatalogScope = 'Tenant',

    [string]$PackagePath = (Join-Path $PSScriptRoot '..\sharepoint\solution\ssd-communities-portal.sppkg'),
    [string]$TemplatePath = (Join-Path $PSScriptRoot '..\provisioning\generated\portal-template.xml'),
    [string]$TenantId = $env:M365_TENANT_ID,
    [string]$ClientId = $env:M365_CLIENT_ID,
    [string]$CertificateBase64 = $env:M365_CERTIFICATE_BASE64,
    [securestring]$CertificatePassword,
    [switch]$Interactive,
    [switch]$SeedSampleData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    throw 'PnP.PowerShell is required. Install it with Install-Module PnP.PowerShell -Scope CurrentUser.'
}
Import-Module PnP.PowerShell

if (-not (Test-Path $PackagePath)) {
    throw "SPFx package not found: $PackagePath"
}
if (-not (Test-Path $TemplatePath)) {
    throw "Provisioning template not found: $TemplatePath"
}

function Connect-PortalSite {
    param([Parameter(Mandatory = $true)][string]$Url)

    if ($Interactive) {
        if ([string]::IsNullOrWhiteSpace($ClientId)) {
            throw 'ClientId is required for interactive PnP authentication.'
        }
        return Connect-PnPOnline -Url $Url -Interactive -ClientId $ClientId -ReturnConnection
    }

    if ([string]::IsNullOrWhiteSpace($TenantId) -or
        [string]::IsNullOrWhiteSpace($ClientId) -or
        [string]::IsNullOrWhiteSpace($CertificateBase64) -or
        $null -eq $CertificatePassword) {
        throw 'Certificate authentication requires TenantId, ClientId, CertificateBase64, and CertificatePassword.'
    }
    return Connect-PnPOnline `
        -Url $Url `
        -Tenant $TenantId `
        -ClientId $ClientId `
        -CertificateBase64Encoded $CertificateBase64 `
        -CertificatePassword $CertificatePassword `
        -ReturnConnection
}

Write-Host "Publishing SPFx package to $AppCatalogScope app catalog..."
$catalogConnection = Connect-PortalSite -Url $AppCatalogUrl
Add-PnPApp `
    -Path (Resolve-Path $PackagePath).Path `
    -Scope $AppCatalogScope `
    -Overwrite `
    -Publish `
    -Connection $catalogConnection | Out-Null

Write-Host "Applying list schema to $SiteUrl..."
$siteConnection = Connect-PortalSite -Url $SiteUrl
Invoke-PnPSiteTemplate -Path (Resolve-Path $TemplatePath).Path -Connection $siteConnection

$listTitles = @(
    'Communities',
    'Community Roles',
    'Charters',
    'IP Catalog',
    'Health Metrics',
    'Forum Retirement'
)
foreach ($listTitle in $listTitles) {
    Set-PnPList -Identity $listTitle -EnableVersioning $true -Connection $siteConnection
}

Set-PnPField -List 'Communities' -Identity 'Title' -Values @{
    Required = $true
    Indexed = $true
    EnforceUniqueValues = $true
} -UpdateExistingLists -Connection $siteConnection
Set-PnPField -List 'Charters' -Identity 'Community' -Values @{
    Required = $true
    Indexed = $true
    EnforceUniqueValues = $true
} -UpdateExistingLists -Connection $siteConnection

$rolesList = Get-PnPList -Identity 'Community Roles' -Connection $siteConnection
$rolesList.ValidationFormula = '=IF([Role]="Family Owner (SME)",NOT(ISBLANK([TimeZone])),TRUE)'
$rolesList.ValidationMessage = 'Time zone is required for Family Owners.'
$rolesList.Update()
Invoke-PnPQuery -Connection $siteConnection

if ($SeedSampleData) {
    & (Join-Path $PSScriptRoot 'Seed-PortalData.ps1') -Connection $siteConnection
}

& (Join-Path $PSScriptRoot 'Set-PortalPermissions.ps1') -Connection $siteConnection
Write-Host 'SSD Communities portal deployment completed.'