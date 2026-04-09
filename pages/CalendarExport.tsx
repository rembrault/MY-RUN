
import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext';
import NeonButton from '../components/NeonButton';

const CalendarExport: React.FC = () => {
    const { program, setPage } = useAppContext();
    const [showExportModal, setShowExportModal] = useState(false);

    return (
        <>
        <Layout>
            <div className="flex flex-col items-center justify-center h-full text-center pt-16">
                <div className="p-6 bg-gradient-to-br from-cyan-500 to-green-500 rounded-2xl inline-block mb-6">
                    <Calendar size={48} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Export calendrier</h1>
                <p className="text-gray-300 max-w-xs mx-auto mb-10">
                    Exportez vos séances vers Google Calendar, Outlook ou Apple Calendar.
                </p>

                {program ? (
                    <div className="w-full">
                        <NeonButton onClick={() => setShowExportModal(true)}>
                            <Download size={20} className="mr-2"/> Exporter en .ics
                        </NeonButton>
                    </div>
                ) : (
                    <div className="text-center w-full">
                        <p className="text-gray-400 mb-4">Aucun programme actif</p>
                        <button
                            onClick={() => setPage('new-program')}
                            className="w-full bg-cyan-500 text-black font-bold py-3 px-6 rounded-full transition-transform hover:scale-105"
                        >
                            Créer un programme
                        </button>
                    </div>
                )}
                 <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 mt-8 w-full text-left">
                    <h3 className="font-bold text-lg mb-2">Comment importer ?</h3>
                    <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                        <li><span className="font-semibold text-gray-200">Google Calendar:</span> Paramètres → Importer</li>
                        <li><span className="font-semibold text-gray-200">Outlook:</span> Fichier → Ouvrir et exporter → Importer/Exporter</li>
                         <li><span className="font-semibold text-gray-200">Apple Calendar:</span> Fichier → Importer</li>
                    </ul>
                </div>
            </div>
        </Layout>

        <Modal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            variant="info"
            title="Export en cours"
            message="L'export de votre fichier .ics est en préparation. Vous pourrez l'importer dans votre calendrier."
            confirmLabel="OK"
            singleAction
        />
        </>
    );
};

export default CalendarExport;
    