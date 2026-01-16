$file = "d:\FluidJobs.ai\FluidJobs.ai\src\components\SuperAdminDashboard.tsx"
$content = Get-Content $file -Raw

# Fix imports
$content = $content -replace 'import ThemedBulkImport from ''\.\.\/new-landing\/company-dashboard\/ThemedBulkImport'';', 'import ThemedBulkImport from ''./ThemedBulkImport'';'
$content = $content -replace 'import \{ ThemeProvider \} from ''\.\.\/new-landing\/candidate-dashboard\/ThemeContext'';', 'import { ThemeProvider } from ''./ThemeContext'';'

# Fix root container
$content = $content -replace 'flex flex-col min-h-screen bg-gray-50', 'flex flex-col h-screen overflow-hidden bg-gray-50'

# Fix header
$content = $content -replace 'sticky top-0 z-50 bg-white shadow-md', 'flex-shrink-0 bg-white shadow-md'

# Fix main container
$content = $content -replace 'flex flex-1 min-h-0', 'flex flex-1 overflow-hidden'

# Fix main content wrapper - add flex-col and remove nested p-8 div
$content = $content -replace '(?s)(<div className=\{`flex-1 overflow-auto transition-all duration-300 \$\{[^}]+\}`\}>)\s*<div className="p-8">', '$1'
$content = $content -replace '(?s)</div>\s*</div>\s*</div>\s*\{/\* Edit User Modal \*/\}', '</div></div>{/* Edit User Modal */}'

Set-Content $file $content -NoNewline
