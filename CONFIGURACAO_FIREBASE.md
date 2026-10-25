# LivroJá — publicação comunitária com Firebase e GitHub Pages

## O que foi criado
- Visitantes enviam anúncios de livros, calculadoras, cadernos e mochilas a uma base de dados partilhada.
- Os anúncios entram como `pendente` e **não ficam públicos até serem aprovados**.
- Conta Google do administrador aprova, rejeita ou elimina publicações.
- Qualquer visitante vê o catálogo dos anúncios aprovados, pode pesquisar no navegador e contactar o atendimento pelo WhatsApp +258 86 043 7495.
- Fotografias opcionais (upload requer Firebase Storage no plano Blaze, que tem faturação). Também aceita um URL HTTPS de uma imagem que já esteja alojada noutro local.
- Este site não trata pagamentos nem publica contactos de vendedores.

## Preparar no Firebase
1. Abre https://console.firebase.google.com/ e cria o projecto `livroja` (ou outro nome livre).
2. Em **Project settings > Your apps**, adiciona uma aplicação **Web**. Copia `apiKey`, `authDomain`, `projectId`, `appId` e, caso uses imagens, `storageBucket`.
3. Abre `firebase-config.js` e substitui os textos vazios pelos valores mostrados pelo Firebase. São chaves de configuração da aplicação Web, não uma chave privada de serviço.
4. Em **Authentication > Sign-in method**, activa **Anonymous** e **Google**. Em **Settings > Authorized domains**, inclui `leinilson689.github.io` se não estiver já autorizado.
5. Em **Firestore Database**, cria uma base de dados. Escolhe uma localização e começa com regras restritas; publica as regras do ficheiro `firestore.rules` (não uses regras abertas de teste).
6. Abre o site e usa **Entrar com Google** na secção Administração. O UID aparece no ecrã. Copia esse UID.
7. No Firestore > Rules, substitui `SUBSTITUIR_PELO_UID_DO_ADMIN` pelo UID exacto que viste. Clica em **Publish**. Sem isso, ninguém terá permissões de administração.
8. Para fotografias por upload: activa o plano **Blaze**, configura **Storage** e publica as regras de `storage.rules`. Este passo pode criar despesas: configura alertas de orçamento. Se não quiseres custos, deixa o upload desactivado e usa apenas anúncios sem foto ou URL HTTPS já disponível.
9. Publica os ficheiros `index.html`, `script.js`, `styles.css`, `config.js`, `firebase-config.js`, `firebase-market.js` no GitHub Pages. Os ficheiros `.rules` são para colar na consola Firebase, não são instalados automaticamente pelo GitHub Pages.
10. Testa: numa janela anónima envia um anúncio, entra como administrador, aprova-o e abre outra janela para ver o anúncio público.

## Segurança e limitações
- É possível enviar sem registo manual, mas o Firebase cria uma identidade anónima técnica para aplicar as regras.
- Só o UID do administrador definido nas **regras do Firestore** pode moderar. Não coloques credenciais privadas no GitHub.
- Utilizadores mal-intencionados podem tentar spam. Em produção, configura App Check, monitorização de custos e limites de utilização; regras por si só não impõem limitação de frequência.
- Fotos e links são públicos após a publicação; modera-os. Regras de Storage aqui deixam ficheiros públicos mesmo antes da aprovação: para privacidade rigorosa de fotos pendentes, é necessária outra arquitectura (por exemplo, servidor de moderação e armazenamento privado).
- O utilizador pode abrir o formulário, mas se Firebase ainda não estiver configurado o botão de envio fica desactivado e surge uma mensagem explicativa.
- Se as credenciais estiverem correctas mas o Google login não funcionar, confirma os domínios autorizados em Firebase Authentication.
- A biblioteca digital permanece demonstrativa; anúncios comunitários passam a ser reais quando ligados à base de dados.
