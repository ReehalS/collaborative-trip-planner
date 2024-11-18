@echo off

cd ".\prisma"
type ".\models\.config.prisma" > "schema.prisma"
echo. >> "schema.prisma"
echo. >> "schema.prisma"

(
    for %%f in (.\models\*.prisma) do (
        IF NOT "%%f" == ".\models\.config.prisma" (
            type "%%f" >> "schema.prisma"
            echo. >> "schema.prisma"
            echo. >> "schema.prisma"
        )
    )
)

npx prisma format