# Controle Saúde V12

- Retatrutida: campo alterado para registrar quantidade em UI (por exemplo, “8 UI”). O app não converte UI em mg nem recomenda dose.
- Persistência extra com IndexedDB, mantendo migração dos dados encontrados nas chaves locais antigas.
- Backup local automático e botões de exportar/restaurar arquivo JSON em Ajustes.
- Cache/Service Worker versionado como v12.

Suba todos os arquivos deste pacote na raiz do repositório GitHub Pages, substituindo os anteriores. Não apague os dados do site nem use “Apagar todos os dados”. Para reduzir o risco de perda, exporte periodicamente um backup em Ajustes e guarde o arquivo em local seguro.

Registros antigos que já contenham dose em mg não são convertidos automaticamente para UI, pois não existe conversão segura sem conhecer a concentração e a preparação exatas.
