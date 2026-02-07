import { Session, WorkoutBlock } from '../types';

export const generateTCX = (session: Session, date: Date): string => {
    // Formatage de la date pour l'ID et le StartTime (UTC)
    const startTime = date.toISOString();
    
    // Création des étapes (Laps) basées sur la structure de la séance
    let lapsXml = '';
    let totalTime = 0;
    
    session.structure.forEach(block => {
        // Durée par défaut de 5 min si non spécifiée (ex: échauffement libre)
        const durationSeconds = (block.duration || 5) * 60; 
        const distanceMeters = (block.distance || 0) * 1000; 
        
        // Intensity: 'Active' pour le corps de séance, 'Resting' pour le reste
        // Garmin utilise cette info pour catégoriser les laps
        const intensity = block.type === 'Corps de séance' ? 'Active' : 'Resting';

        // Construction du Lap
        // TriggerMethod Manual permet à l'utilisateur de passer l'étape manuellement s'il le souhaite, 
        // ou alors c'est basé sur le temps/distance. Ici on met une structure générique.
        lapsXml += `
        <Lap StartTime="${new Date(date.getTime() + totalTime * 1000).toISOString()}">
          <TotalTimeSeconds>${durationSeconds}</TotalTimeSeconds>
          <DistanceMeters>${distanceMeters}</DistanceMeters>
          <Intensity>${intensity}</Intensity>
          <TriggerMethod>Manual</TriggerMethod>
          <Notes>${block.details.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Notes>
        </Lap>`;
        
        totalTime += durationSeconds;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Activities>
    <Activity Sport="Running">
      <Id>${startTime}</Id>
      ${lapsXml}
      <Notes>${session.title} - ${session.type}</Notes>
      <Creator xsi:type="Device_t">
        <Name>MY RUN App</Name>
      </Creator>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
};

export const downloadGarminFile = (session: Session, date?: Date) => {
    // Si pas de date fournie, on prend la date du jour ou une date fictive
    const sessionDate = date || new Date();
    
    const tcxContent = generateTCX(session, sessionDate);
    const blob = new Blob([tcxContent], { type: 'application/vnd.garmin.tcx+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    // Nom de fichier sécurisé
    const safeTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `myrun_${safeTitle}.tcx`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};