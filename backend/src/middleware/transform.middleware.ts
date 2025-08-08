// Créez un nouveau middleware dans middleware/transform.middleware.ts

export const transformRegisterData = (req: any, res: any, next: any) => {
  // Transformer phoneNumber en phone_number
  if (req.body.phoneNumber && !req.body.phone_number) {
    req.body.phone_number = req.body.phoneNumber;
  }
  
  // Extraire firstName et lastName du name si non fournis
  if (req.body.name && (!req.body.firstName || !req.body.lastName)) {
    const nameParts = req.body.name.split(' ');
    req.body.firstName = req.body.firstName || nameParts[0] || '';
    req.body.lastName = req.body.lastName || nameParts.slice(1).join(' ') || '';
  }
  
  // Pour les startups, ajouter les champs requis avec des valeurs par défaut
  if (req.body.role === 'STARTUP') {
    req.body.companyName = req.body.companyName || req.body.name;
    req.body.registrationNumber = req.body.registrationNumber || `REG-${Date.now()}`;
    req.body.legalName = req.body.legalName || req.body.name;
    req.body.description = req.body.description || 'Description à compléter';
    req.body.sector = req.body.sector || 'tech';
    req.body.country = req.body.country || 'Côte d\'Ivoire';
  }
  
  console.log('📝 Transformed data:', req.body);
  next();
};

// Puis dans auth.routes.ts, utilise