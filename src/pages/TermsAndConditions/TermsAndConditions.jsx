import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Warning,
  ProhibitInset,
  Chat,
  Prohibit,
  Wrench,
  UsersFour,
  Dog,
  UserCircleGear
} from "phosphor-react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const termsContainerRef = useRef(null);

  // Armazena a URL anterior na montagem do componente
  const [previousPage, setPreviousPage] = useState("/login");

  useEffect(() => {
    // Tenta obter a página anterior do histórico
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.origin === window.location.origin) {
        setPreviousPage(referrerUrl.pathname);
      }
    }
  }, []);

  const handleGoBack = () => {
    // Navega para a página anterior
    navigate(previousPage);
  };

  // Função para aceitar os termos e voltar à tela anterior
  const handleAccept = () => {
    // Volta para a página anterior
    navigate(previousPage);
  };

  return (
    <div className="terms-page">
      <div className="terms-header">
        <button className="back-button" onClick={handleGoBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>Termos e Condições</h1>
      </div>

      <div className="terms-content" ref={termsContainerRef}>
        <section>
          <h2>1. Introdução e Definições</h2>
          <p>
            Bem-vindo à plataforma CenterPet ("Plataforma"), desenvolvida e mantida pela empresa CenterPet ("nós", "nossos").
          </p>
          <p>
            Estes Termos e Condições de Uso ("Termos") constituem um contrato vinculativo entre você, pessoa física ou jurídica ("Usuário", "você" ou "seu")
            e a CenterPet, e regem o acesso e uso da Plataforma, incluindo todos os conteúdos, funcionalidades e serviços disponibilizados através de nosso site,
            aplicativo móvel e interfaces correlatas.
          </p>
          <p>
            Para os fins destes Termos:
          </p>
          <ul>
            <li>"Adotante" refere-se ao Usuário que busca adotar animais através da Plataforma;</li>
            <li>"ONG" refere-se às organizações não-governamentais, abrigos, protetores independentes e outras entidades que disponibilizam animais para adoção;</li>
            <li>"Safe Adopter" refere-se ao status conferido ao Adotante que completou o processo de verificação e aprovação estabelecido pela Plataforma;</li>
            <li>"Conteúdo" refere-se a textos, gráficos, imagens, músicas, softwares, áudios, vídeos, informações ou outros materiais;</li>
            <li>"Dados Pessoais" refere-se a qualquer informação relacionada a pessoa natural identificada ou identificável, conforme definido pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
          </ul>
        </section>

        <section>
          <h2>2. Aceitação dos Termos</h2>
          <p>
            2.1. <strong>Concordância Expressa:</strong> Ao acessar ou utilizar nossa Plataforma, você declara expressamente que leu, compreendeu e concordou
            com estes Termos, bem como com nossa Política de Privacidade, incorporada a este documento por referência.
          </p>
          <p>
            2.2. <strong>Capacidade Legal:</strong> Você declara e garante que possui capacidade civil plena para celebrar este acordo, nos termos dos artigos
            3º a 5º do Código Civil Brasileiro (Lei nº 10.406/2002). Caso seja menor de 18 anos ou legalmente incapaz, você confirma que obteve autorização
            prévia de seus pais, tutores ou representantes legais, que também se vinculam a estes Termos.
          </p>
          <p>
            2.3. <strong>Alterações nos Termos:</strong> A CenterPet reserva-se o direito de modificar estes Termos a qualquer momento, a seu exclusivo critério.
            As modificações entrarão em vigor imediatamente após sua publicação na Plataforma. Seu uso continuado da Plataforma após a publicação de quaisquer
            alterações constitui aceitação dessas alterações. É sua responsabilidade verificar periodicamente estes Termos para se manter informado sobre eventuais modificações.
          </p>
        </section>

        <section>
          <h2>3. Cadastro e Segurança da Conta</h2>
          <p>
            3.1. <strong>Registro de Conta:</strong> Para acessar determinadas funcionalidades da Plataforma, você deverá se cadastrar e criar uma conta.
            Você se compromete a fornecer informações precisas, completas e atualizadas durante o processo de registro e a mantê-las atualizadas.
          </p>
          <p>
            3.2. <strong>Veracidade das Informações:</strong> Você declara e garante que todas as informações fornecidas durante o cadastro são verdadeiras,
            precisas e completas, e assume integralmente a responsabilidade civil e criminal pela veracidade e exatidão dos dados informados, nos termos do
            Art. 299 do Código Penal Brasileiro.
          </p>
          <p>
            3.3. <strong>Responsabilidade pela Conta:</strong> Você é exclusivamente responsável por manter a confidencialidade de sua senha e por todas as
            atividades realizadas em sua conta. Você concorda em notificar imediatamente a CenterPet sobre qualquer uso não autorizado de sua conta ou
            qualquer outra violação de segurança.
          </p>
          <p>
            3.4. <strong>Uso Pessoal:</strong> Cada conta é pessoal e intransferível. É vedada a criação de mais de um cadastro por pessoa física ou jurídica,
            bem como a transferência, cessão, venda ou compartilhamento da conta com terceiros.
          </p>
          <p>
            3.5. <strong>Recusa ou Cancelamento de Cadastro:</strong> A CenterPet reserva-se o direito de recusar qualquer solicitação de cadastro e de cancelar
            um cadastro previamente aceito, a seu exclusivo critério, especialmente nos casos de violação destes Termos, fornecimento de informações falsas,
            prática de atos ilícitos ou que possam prejudicar outros Usuários.
          </p>
        </section>

        <section>
          <h2>4. Processo de Adoção</h2>
          <p>
            4.1. <strong>Programa Safe Adopter:</strong> A Plataforma implementa o programa "Safe Adopter" para verificar e certificar potenciais adotantes.
            Para solicitar a adoção de um animal, os Adotantes devem obter o status de "Safe Adopter", que requer o preenchimento de um formulário detalhado
            com informações pessoais, comprovação de residência, situação de moradia, experiência prévia com animais, entre outras informações relevantes.
          </p>
          <p>
            4.2. <strong>Verificação de Informações:</strong> A CenterPet reserva-se o direito de verificar as informações fornecidas pelos Adotantes,
            podendo solicitar documentos adicionais, realizar entrevistas virtuais ou presenciais, e até mesmo visitas domiciliares (diretamente ou por
            meio das ONGs parceiras), para avaliar a adequação do ambiente para receber o animal.
          </p>
          <p>
            4.3. <strong>Direito de Recusa:</strong> As ONGs têm o direito exclusivo e final de aprovar ou recusar qualquer solicitação de adoção,
            sem necessidade de justificativa. A CenterPet não garante que qualquer solicitação de adoção será aprovada.
          </p>
          <p>
            4.4. <strong>Termos de Adoção:</strong> As ONGs podem estabelecer seus próprios termos e condições para a adoção de animais, incluindo
            visitas pós-adoção, castração obrigatória, vacinação periódica, entre outros requisitos específicos. Ao solicitar a adoção, o Adotante
            concorda em cumprir com os termos específicos estabelecidos pela ONG responsável pelo animal.
          </p>
          <p>
            4.5. <strong>Responsabilidades pós-adoção:</strong> Ao adotar um animal através da Plataforma, o Adotante assume as seguintes responsabilidades:
          </p>
          <ul>
            <li>Proporcionar alimentação adequada, abrigo, segurança e cuidados veterinários regulares;</li>
            <li>Garantir o bem-estar físico e psicológico do animal;</li>
            <li>Cumprir a legislação aplicável à posse responsável de animais, incluindo as leis municipais, estaduais e federais;</li>
            <li>Não abandonar, negligenciar ou maltratar o animal, sob pena de responsabilidade civil e criminal, nos termos da Lei de Crimes Ambientais (Lei nº 9.605/1998);</li>
            <li>Não utilizar o animal para fins comerciais, reprodução não autorizada, experimentação ou qualquer forma de exploração.</li>
          </ul>
          <p>
            4.6. <strong>Termos de Devolução:</strong> Caso o Adotante não possa mais cuidar do animal adotado, compromete-se a devolvê-lo prioritariamente
            à ONG de origem ou, mediante acordo prévio, buscar um novo lar responsável, nunca abandonando o animal ou entregando-o a terceiros sem a devida
            verificação e aprovação.
          </p>
        </section>

        <section>
          <h2>5. Condutas Proibidas</h2>
          <p>
            Ao utilizar nossa Plataforma, você concorda em não:
          </p>
          <ul className="conduct-rules">
            <li>
              <div className="rule-icon"><Warning size={18} weight="fill" /></div>
              <div className="rule-text">Fornecer informações falsas ou enganosas sobre você, sua residência ou sobre animais, podendo tal conduta configurar crime de falsidade ideológica</div>
            </li>
            <li>
              <div className="rule-icon"><ProhibitInset size={18} weight="fill" /></div>
              <div className="rule-text">Utilizar a Plataforma para qualquer finalidade ilícita, fraudulenta ou não autorizada por estes Termos</div>
            </li>
            <li>
              <div className="rule-icon"><Chat size={18} weight="fill" /></div>
              <div className="rule-text">Assediar, ameaçar, intimidar, coagir ou discriminar outros Usuários por qualquer motivo</div>
            </li>
            <li>
              <div className="rule-icon"><Prohibit size={18} weight="fill" /></div>
              <div className="rule-text">Publicar, transmitir ou compartilhar Conteúdo que seja ilegal, difamatório, calunioso, ofensivo, obsceno, pornográfico ou que viole direitos de terceiros</div>
            </li>
            <li>
              <div className="rule-icon"><Wrench size={18} weight="fill" /></div>
              <div className="rule-text">Interferir ou tentar interferir no funcionamento adequado da Plataforma, incluindo o uso de malware, vírus ou outros códigos maliciosos</div>
            </li>
            <li>
              <div className="rule-icon"><UsersFour size={18} weight="fill" /></div>
              <div className="rule-text">Criar múltiplas contas para contornar regras, restrições ou bloqueios impostos pela Plataforma</div>
            </li>
            <li>
              <div className="rule-icon"><Dog size={18} weight="fill" /></div>
              <div className="rule-text">Adotar animais para revenda, reprodução comercial, experimentação, rinhas ou qualquer forma de exploração comercial ou ilegal</div>
            </li>
            <li>
              <div className="rule-icon"><UserCircleGear size={18} weight="fill" /></div>
              <div className="rule-text">Usar informações obtidas através da Plataforma para fins de stalking, assédio, ou para prejudicar outros Usuários</div>
            </li>
          </ul>
          <p>
            A violação de qualquer uma destas proibições poderá resultar, a exclusivo critério da CenterPet, na suspensão ou encerramento de sua conta,
            sem prejuízo das medidas legais cabíveis nas esferas civil e criminal.
          </p>
        </section>

        <section>
          <h2>6. Proteção de Dados e Privacidade</h2>
          <p>
            6.1. <strong>Lei Geral de Proteção de Dados:</strong> A CenterPet processa Dados Pessoais em conformidade com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018 - "LGPD") e demais normas aplicáveis. Nossa Política de Privacidade, parte integrante destes Termos, detalha como coletamos,
            utilizamos, armazenamos e protegemos seus Dados Pessoais.
          </p>
          <p>
            6.2. <strong>Consentimento:</strong> Ao utilizar nossa Plataforma e fornecer seus Dados Pessoais, você consente expressamente com o tratamento
            desses dados conforme descrito em nossa Política de Privacidade.
          </p>
          <p>
            6.3. <strong>Finalidade do Tratamento:</strong> Seus Dados Pessoais serão utilizados para as seguintes finalidades:
          </p>
          <ul>
            <li>Viabilizar o processo de adoção, incluindo a verificação de adequação como "Safe Adopter";</li>
            <li>Conectar Adotantes e ONGs;</li>
            <li>Comunicação entre a CenterPet, Adotantes e ONGs;</li>
            <li>Melhorar e personalizar a experiência do Usuário na Plataforma;</li>
            <li>Cumprir obrigações legais e regulatórias;</li>
            <li>Prevenir fraudes e garantir a segurança da Plataforma.</li>
          </ul>
          <p>
            6.4. <strong>Direitos do Titular:</strong> Você possui direitos relacionados aos seus Dados Pessoais, incluindo acesso, correção, portabilidade,
            exclusão, revogação do consentimento, entre outros, nos termos da LGPD. Para exercer seus direitos, entre em contato conosco pelos canais
            indicados na seção "Contato" destes Termos.
          </p>
        </section>

        <section>
          <h2>7. Propriedade Intelectual e Licenças</h2>
          <p>
            7.1. <strong>Propriedade da Plataforma:</strong> A Plataforma, incluindo todo o seu conteúdo, características, funcionalidades, código-fonte,
            design, textos, marcas, logotipos e elementos visuais (exceto o Conteúdo gerado pelos Usuários) são de propriedade exclusiva da CenterPet ou
            de seus licenciadores, e são protegidos pelas leis brasileiras e tratados internacionais de direitos autorais, marcas, patentes e propriedade intelectual.
          </p>
          <p>
            7.2. <strong>Licença Limitada:</strong> A CenterPet concede a você uma licença limitada, não exclusiva, não transferível e revogável para acessar
            e utilizar a Plataforma para fins pessoais e não comerciais, sujeita à sua conformidade com estes Termos.
          </p>
          <p>
            7.3. <strong>Conteúdo do Usuário:</strong> Você mantém todos os direitos de propriedade intelectual sobre o Conteúdo que você publica, carrega
            ou disponibiliza na Plataforma ("Conteúdo do Usuário").
          </p>
          <p>
            7.4. <strong>Licença do Conteúdo do Usuário:</strong> Ao publicar qualquer Conteúdo na Plataforma, você concede à CenterPet uma licença mundial,
            não exclusiva, gratuita, sublicenciável e transferível para usar, reproduzir, distribuir, preparar trabalhos derivados, exibir e executar esse
            Conteúdo em conexão com a operação e promoção da Plataforma.
          </p>
          <p>
            7.5. <strong>Garantias sobre o Conteúdo:</strong> Você declara e garante que: (i) é o criador e proprietário do Conteúdo que publica na Plataforma
            ou possui as licenças, direitos, consentimentos e permissões necessários para conceder os direitos aqui licenciados; e (ii) seu Conteúdo não viola
            direitos de privacidade, publicidade, direitos autorais, marcas registradas, direitos contratuais ou quaisquer outros direitos de qualquer pessoa.
          </p>
        </section>

        <section>
          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            8.1. <strong>Natureza da Plataforma:</strong> A CenterPet atua como intermediária entre Adotantes e ONGs, facilitando o processo de adoção de animais.
            A CenterPet não é proprietária dos animais disponíveis para adoção e não realiza diretamente os processos de adoção.
          </p>
          <p>
            8.2. <strong>Isenção de Garantias:</strong> A Plataforma é fornecida "no estado em que se encontra" e "conforme disponível", sem garantias de
            qualquer tipo, expressas ou implícitas. A CenterPet não garante que a Plataforma funcionará sem interrupções, de forma segura ou livre de erros.
          </p>
          <p>
            8.3. <strong>Limites de Responsabilidade:</strong> Na máxima extensão permitida pela lei aplicável, a CenterPet, seus diretores, funcionários,
            agentes e parceiros não serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem
            limitação, perda de lucros, dados, uso, boa-vontade ou outras perdas intangíveis, resultantes de:
          </p>
          <ul>
            <li>Seu acesso ou uso ou incapacidade de acessar ou usar a Plataforma;</li>
            <li>Qualquer conduta ou Conteúdo de terceiros na Plataforma, incluindo, sem limitação, qualquer comportamento difamatório, ofensivo ou ilegal;</li>
            <li>Qualquer Conteúdo obtido da Plataforma;</li>
            <li>Acesso não autorizado, uso ou alteração de suas transmissões ou Conteúdo;</li>
            <li>A conduta de Adotantes ou ONGs antes, durante ou após o processo de adoção;</li>
            <li>O comportamento, saúde ou condições dos animais disponibilizados para adoção.</li>
          </ul>
          <p>
            8.4. <strong>Limitação de Valor:</strong> Em nenhuma hipótese a responsabilidade total da CenterPet perante você por todos os danos, perdas e
            causas de ação excederá o valor que você pagou à CenterPet, se houver, para acessar ou utilizar a Plataforma durante os seis meses anteriores
            à ocorrência da causa da ação, ou R$ 500,00 (quinhentos reais), o que for maior.
          </p>
          <p>
            8.5. <strong>Legislação Aplicável:</strong> Algumas jurisdições não permitem a exclusão ou limitação de responsabilidade por danos consequenciais
            ou incidentais, portanto, algumas das limitações acima podem não se aplicar a você. Nestes casos, a responsabilidade da CenterPet será limitada
            ao máximo permitido por lei.
          </p>
        </section>

        <section>
          <h2>9. Indenização</h2>
          <p>
            Você concorda em defender, indenizar e isentar a CenterPet, seus diretores, funcionários, agentes, parceiros e licenciadores de e contra quaisquer
            reclamações, danos, obrigações, perdas, responsabilidades, custos ou dívidas e despesas (incluindo, mas não se limitando a honorários advocatícios)
            decorrentes de: (i) seu uso e acesso à Plataforma; (ii) sua violação de qualquer termo destes Termos; (iii) sua violação de quaisquer direitos de
            terceiros, incluindo, sem limitação, quaisquer direitos autorais, de propriedade ou de privacidade; ou (iv) qualquer alegação de que seu Conteúdo
            causou danos a terceiros.
          </p>
        </section>

        <section>
          <h2>10. Disposições Gerais</h2>
          <p>
            10.1. <strong>Legislação Aplicável:</strong> Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil,
            independentemente das disposições sobre conflito de leis.
          </p>
          <p>
            10.2. <strong>Foro:</strong> Fica eleito o foro da Comarca de [inserir comarca], Estado de [inserir estado], para dirimir quaisquer dúvidas ou
            controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </p>
          <p>
            10.3. <strong>Independência das Cláusulas:</strong> Se qualquer disposição destes Termos for considerada inválida ou inexequível, tal disposição
            será limitada ou eliminada na medida mínima necessária, e as demais disposições destes Termos permanecerão em pleno vigor e efeito.
          </p>
          <p>
            10.4. <strong>Acordo Integral:</strong> Estes Termos, juntamente com a Política de Privacidade e quaisquer outros avisos legais publicados pela
            CenterPet na Plataforma, constituem o acordo integral entre você e a CenterPet em relação ao uso da Plataforma.
          </p>
          <p>
            10.5. <strong>Renúncia:</strong> A falha da CenterPet em exercer ou fazer cumprir qualquer direito ou disposição destes Termos não constituirá
            renúncia a tal direito ou disposição.
          </p>
          <p>
            10.6. <strong>Cessão:</strong> Você não pode ceder ou transferir estes Termos, por força de lei ou de outra forma, sem o consentimento prévio
            por escrito da CenterPet. Qualquer tentativa de cessão por você será nula e sem efeito. A CenterPet pode ceder estes Termos sem restrições.
          </p>
          <p>
            10.7. <strong>Notificações:</strong> Qualquer notificação ou outra comunicação a ser fornecida nos termos destes Termos, será feita por escrito
            e entregue por e-mail (no caso da CenterPet, para o endereço especificado na seção "Contato", e no seu caso, para o endereço de e-mail associado
            à sua conta).
          </p>
        </section>

        <section>
          <h2>11. Contato</h2>
          <p>
            Para esclarecer dúvidas, apresentar reclamações, solicitar informações ou para qualquer outro fim relacionado a estes Termos, você pode entrar
            em contato conosco através do e-mail: <a href="mailto:contatosuporte.centerpet@gmail.com">contato@centerpet.com.br</a>
          </p>
          <p>
            Última atualização destes Termos: 26 de maio de 2025.
          </p>
        </section>
      </div>

      {/* Adicionar a seção de ações com o botão de aceitar */}
      <div className="terms-actions">
        <button
          className="accept-button"
          onClick={handleAccept}
        >
          Aceitar Termos e Continuar
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;