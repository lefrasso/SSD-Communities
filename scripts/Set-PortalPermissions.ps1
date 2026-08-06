[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [object]$Connection
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$groupNames = @{
    Members = 'SSD Community Members'
    Leads = 'SSD Community Leads'
    FamilyOwners = 'SSD Family Owners'
    ProgramManagers = 'SSD Community Program Managers'
    ExecutiveSponsors = 'SSD Executive Sponsors'
}

foreach ($groupName in $groupNames.Values) {
    $group = Get-PnPGroup -Identity $groupName -ErrorAction SilentlyContinue -Connection $Connection
    if ($null -eq $group) {
        New-PnPGroup -Title $groupName -Connection $Connection | Out-Null
    }
}

$listTitles = @(
    'Communities',
    'Community Roles',
    'Charters',
    'IP Catalog',
    'Health Metrics',
    'Forum Retirement'
)

foreach ($listTitle in $listTitles) {
    Set-PnPList -Identity $listTitle -BreakRoleInheritance -CopyRoleAssignments -Connection $Connection
    Set-PnPListPermission -Identity $listTitle -Group $groupNames.Members -AddRole 'Read' -Connection $Connection
    Set-PnPListPermission -Identity $listTitle -Group $groupNames.Leads -AddRole 'Read' -Connection $Connection
    Set-PnPListPermission -Identity $listTitle -Group $groupNames.FamilyOwners -AddRole 'Read' -Connection $Connection
    Set-PnPListPermission -Identity $listTitle -Group $groupNames.ProgramManagers -AddRole 'Full Control' -Connection $Connection
    Set-PnPListPermission -Identity $listTitle -Group $groupNames.ExecutiveSponsors -AddRole 'Read' -Connection $Connection
}

function Get-CommunityScopedItems {
    param([string]$ListTitle, [string]$LookupField, [int]$CommunityId)
    return Get-PnPListItem `
        -List $ListTitle `
        -Query "<View><Query><Where><Eq><FieldRef Name='$LookupField' LookupId='TRUE'/><Value Type='Lookup'>$CommunityId</Value></Eq></Where></Query><RowLimit Paged='TRUE'>500</RowLimit></View>" `
        -Connection $Connection
}

$roles = Get-PnPListItem -List 'Community Roles' -PageSize 500 -Fields 'Community', 'Person', 'Role', 'Active' -Connection $Connection
$activeRoles = $roles | Where-Object { $_['Active'] -eq $true }
$communities = Get-PnPListItem -List 'Communities' -PageSize 500 -Connection $Connection

foreach ($community in $communities) {
    $communityId = $community.Id
    $communityRoles = $activeRoles | Where-Object { $_['Community'].LookupId -eq $communityId }
    $leads = $communityRoles | Where-Object { $_['Role'] -eq 'Community Lead' }
    $owners = $communityRoles | Where-Object { $_['Role'] -eq 'Family Owner (SME)' }

    foreach ($lead in $leads) {
        $loginName = $lead['Person'].Email
        if ([string]::IsNullOrWhiteSpace($loginName)) { continue }
        Set-PnPListItemPermission -List 'Communities' -Identity $communityId -User $loginName -AddRole 'Contribute' -Connection $Connection
        foreach ($mapping in @(
            @{ List = 'Community Roles'; Field = 'Community' },
            @{ List = 'Charters'; Field = 'Community' },
            @{ List = 'IP Catalog'; Field = 'OwningCommunity' },
            @{ List = 'Health Metrics'; Field = 'Community' }
        )) {
            foreach ($item in Get-CommunityScopedItems -ListTitle $mapping.List -LookupField $mapping.Field -CommunityId $communityId) {
                Set-PnPListItemPermission -List $mapping.List -Identity $item.Id -User $loginName -AddRole 'Contribute' -Connection $Connection
            }
        }
    }

    foreach ($owner in $owners) {
        $loginName = $owner['Person'].Email
        if ([string]::IsNullOrWhiteSpace($loginName)) { continue }
        foreach ($mapping in @(
            @{ List = 'Charters'; Field = 'Community' },
            @{ List = 'IP Catalog'; Field = 'OwningCommunity' }
        )) {
            foreach ($item in Get-CommunityScopedItems -ListTitle $mapping.List -LookupField $mapping.Field -CommunityId $communityId) {
                Set-PnPListItemPermission -List $mapping.List -Identity $item.Id -User $loginName -AddRole 'Contribute' -Connection $Connection
            }
        }
    }
}

Write-Host 'SharePoint groups, list permissions, and community-scoped item grants are synchronized.'