import React from 'react';
import WorkLocationManager from './WorkLocationManager';

// "Repoem a pagina de local de trabalho com sua s funcionalidade"
// Interpretation: The user wants the Workspace component to provide Work Location management.
export default function Workspace({ invoices, purchases, onViewInvoice }: any) {
    return (
        <div className="h-full">
            <WorkLocationManager />
        </div>
    );
}
