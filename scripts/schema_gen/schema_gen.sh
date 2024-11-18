cd ./prisma/models
rm -rf ../schema.prisma
(cat .config.prisma; echo; echo) >> ../schema.prisma
for schema in *.prisma; do (cat "${schema}"; echo; echo) >> ../schema.prisma; done
cd ..
npx prisma format