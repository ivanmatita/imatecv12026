import React, { useState } from 'react';
import WorkLocationManager from './WorkLocationManager';
import GestaoLocalTrabalho from './GestaoLocalTrabalho';

// "Repoem a pagina de local de trabalho com sua s funcionalidade"
// Interpretation: The user wants the Workspace component to provide Work Location management.
export default function Workspace({ invoices, purchases, onViewInvoice }: any) {
    const [currentView, setCurrentView] = useState<'list' | 'gestao'>('list');
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    function handleNavigateToGestao(locationId: string) {
        setSelectedLocationId(locationId);
        setCurrentView('gestao');
    }

    function handleBackToList() {
        setCurrentView('list');
        setSelectedLocationId(null);
    }

    return (
        <div className="h-full">
            {currentView === 'list' && (
                <WorkLocationManager onNavigateToGestao={handleNavigateToGestao} />
            )}
            {currentView === 'gestao' && selectedLocationId && (
                <GestaoLocalTrabalho
                    locationId={selectedLocationId}
                    onClose={handleBackToList}
                />
            )}
        </div>
    );
}
