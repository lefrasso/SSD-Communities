[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [object]$Connection,

    [string]$DataPath = (Join-Path $PSScriptRoot '..\provisioning\sample-data.json'),
    [string]$ChoiceConfigPath = (Join-Path $PSScriptRoot '..\provisioning\config.sample.json')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$data = Get-Content $DataPath -Raw | ConvertFrom-Json
$choices = Get-Content $ChoiceConfigPath -Raw | ConvertFrom-Json
$communityIds = @{}

function Get-PortalItemByTitle {
    param([string]$ListTitle, [string]$Title)
    $escaped = $Title.Replace("'", "''")
    return Get-PnPListItem `
        -List $ListTitle `
        -Query "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>$escaped</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>" `
        -Connection $Connection | Select-Object -First 1
}

$web = Get-PnPWeb -Includes CurrentUser -Connection $Connection
$currentUser = $web.CurrentUser
if ($null -eq $currentUser) {
    throw 'The current SharePoint user could not be resolved for sample sign-offs.'
}

foreach ($community in $data.communities) {
    $existing = Get-PortalItemByTitle -ListTitle 'Communities' -Title $community.title
    if ($null -eq $existing) {
        $existing = Add-PnPListItem -List 'Communities' -Values @{
            Title = $community.title
            ServiceFamily = $community.serviceFamily
            ScopeInScope = $community.scopeInScope
            ScopeOutOfScope = $community.scopeOutOfScope
            TargetRoles = ($community.targetRoles -join ';#')
            IsCrossCommunity = [bool]$community.isCrossCommunity
            Status = $community.status
            LaunchDate = (Get-Date).ToString('yyyy-MM-dd')
        } -Connection $Connection
    }
    $communityIds[$community.key] = $existing.Id

    $charter = Get-PnPListItem `
        -List 'Charters' `
        -Query "<View><Query><Where><Eq><FieldRef Name='Community' LookupId='TRUE'/><Value Type='Lookup'>$($existing.Id)</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>" `
        -Connection $Connection | Select-Object -First 1
    if ($null -eq $charter) {
        $today = (Get-Date).ToString('s')
        Add-PnPListItem -List 'Charters' -Values @{
            Community = $existing.Id
            InteractionModel = 'Monthly community session, weekly asynchronous exchange, and scheduled office hours.'
            Cadence = 'Monthly session; weekly office hours'
            ReadinessPlan = 'Maintain role-based readiness paths and publish reusable delivery IP each quarter.'
            LaunchReadiness = ($choices.launchReadiness -join ';#')
            Status = 'Signed off'
            SignOffLead = $currentUser.LoginName
            SignOffLeadDate = $today
            SignOffPM = $currentUser.LoginName
            SignOffPMDate = $today
            SignOffFamilyOwner = $currentUser.LoginName
            SignOffFamilyOwnerDate = $today
            CharterVersion = '1.0'
        } -Connection $Connection | Out-Null
    }

    $lead = Get-PnPListItem `
        -List 'Community Roles' `
        -Query "<View><Query><Where><And><Eq><FieldRef Name='Community' LookupId='TRUE'/><Value Type='Lookup'>$($existing.Id)</Value></Eq><Eq><FieldRef Name='Role'/><Value Type='Choice'>Community Lead</Value></Eq></And></Where></Query><RowLimit>1</RowLimit></View>" `
        -Connection $Connection | Select-Object -First 1
    if ($null -eq $lead) {
        Add-PnPListItem -List 'Community Roles' -Values @{
            Community = $existing.Id
            Person = $currentUser.LoginName
            Role = 'Community Lead'
            SourceOrg = 'Delivery'
            Active = $true
        } -Connection $Connection | Out-Null
    }
}

foreach ($ipItem in $data.ipCatalog) {
    if ($null -eq (Get-PortalItemByTitle -ListTitle 'IP Catalog' -Title $ipItem.title)) {
        Add-PnPListItem -List 'IP Catalog' -Values @{
            Title = $ipItem.title
            OwningCommunity = $communityIds[$ipItem.communityKey]
            Description = $ipItem.description
        } -Connection $Connection | Out-Null
    }
}

foreach ($metric in $data.healthMetrics) {
    $communityId = $communityIds[$metric.communityKey]
    $query = "<View><Query><Where><And><Eq><FieldRef Name='Community' LookupId='TRUE'/><Value Type='Lookup'>$communityId</Value></Eq><And><Eq><FieldRef Name='Measure'/><Value Type='Choice'>$($metric.measure)</Value></Eq><Eq><FieldRef Name='Period'/><Value Type='Choice'>$($metric.period)</Value></Eq></And></And></Where></Query><RowLimit>1</RowLimit></View>"
    $existing = Get-PnPListItem -List 'Health Metrics' -Query $query -Connection $Connection | Select-Object -First 1
    if ($null -eq $existing) {
        Add-PnPListItem -List 'Health Metrics' -Values @{
            Community = $communityId
            Measure = $metric.measure
            Period = $metric.period
            Value = [double]$metric.value
            Unit = $metric.unit
            IsBaseline = [bool]$metric.isBaseline
            Commentary = $metric.commentary
        } -Connection $Connection | Out-Null
    }
}

foreach ($forum in $data.forumRetirement) {
    if ($null -eq (Get-PortalItemByTitle -ListTitle 'Forum Retirement' -Title $forum.title)) {
        $values = @{
            Title = $forum.title
            Disposition = $forum.disposition
            TargetCommunity = $communityIds[$forum.targetCommunityKey]
        }
        if ($forum.completionDate) {
            $values.CompletionDate = $forum.completionDate
        }
        Add-PnPListItem -List 'Forum Retirement' -Values $values -Connection $Connection | Out-Null
    }
}

Write-Host 'Representative development data is ready.'