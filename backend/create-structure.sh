#!/bin/bash
mkdir -p backend/{src,tests,scripts,prisma}
mkdir -p backend/src/{config,controllers,services,models,middleware,routes,utils,types}
mkdir -p backend/tests/{unit,integration,e2e}

# Frontend
mkdir -p frontend/{src,public,tests}
mkdir -p frontend/src/{components,pages,hooks,services,utils,styles,types,store}
mkdir -p frontend/src/components/{common,auth,startup,trading,portfolio,wallet}

# Mobile
mkdir -p mobile/{src,android,ios,assets}
mkdir -p mobile/src/{screens,components,services,utils,hooks,store,navigation,styles}

# Docs
mkdir -p docs/{api,guides,diagrams}

# Scripts et config
mkdir -p scripts/{deployment,maintenance,development}
mkdir -p config/{kubernetes,docker,nginx,monitoring}

echo "✅ Toute la structure a été créée avec succès !"
