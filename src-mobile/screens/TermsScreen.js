import React from "react";
import { ScrollView, Text, View } from "react-native";
import AppScreen from "../components/ui/AppScreen";
import PageIntro from "../components/ui/PageIntro";
import PinkCard from "../components/ui/PinkCard";
import AppButton from "../components/ui/AppButton";

const sections = [
  {
    title: "1. Introducao e Definicoes",
    paragraphs: [
      "Bem-vindo a plataforma CenterPet. Estes Termos e Condicoes de Uso constituem um contrato entre voce e a CenterPet e regem o acesso ao site, aplicativo e servicos relacionados.",
      "Para estes Termos: Adotante e o usuario que busca adotar animais; ONG inclui organizacoes, abrigos e protetores; Safe Adopter e o adotante aprovado no processo de verificacao; Conteudo inclui textos, imagens, videos e outros materiais; Dados Pessoais seguem a definicao da Lei Geral de Protecao de Dados."
    ]
  },
  {
    title: "2. Aceitacao dos Termos",
    paragraphs: [
      "Ao acessar ou utilizar a plataforma, voce declara que leu, compreendeu e concordou com estes Termos e com a Politica de Privacidade.",
      "Voce declara que possui capacidade legal para celebrar este acordo. Caso seja menor de idade ou incapaz, a utilizacao deve ocorrer com autorizacao de responsavel legal.",
      "A CenterPet pode alterar estes Termos a qualquer momento. O uso continuado da plataforma apos a publicacao das alteracoes representa aceite."
    ]
  },
  {
    title: "3. Cadastro e Seguranca da Conta",
    paragraphs: [
      "Para usar funcionalidades especificas, voce devera criar conta e fornecer dados verdadeiros, completos e atualizados.",
      "Voce e responsavel por manter a confidencialidade da senha e por todas as atividades realizadas na conta.",
      "Cada conta e pessoal e intransferivel. A CenterPet pode recusar ou cancelar cadastro em caso de violacao destes Termos."
    ]
  },
  {
    title: "4. Processo de Adocao",
    paragraphs: [
      "A plataforma utiliza o programa Safe Adopter para validacao de adotantes. As ONGs podem solicitar documentos, entrevistas e outras validacoes.",
      "A decisao final de aprovar ou recusar uma solicitacao de adocao pertence a ONG responsavel, sem obrigacao de justificativa.",
      "Ao adotar, o usuario assume responsabilidade por alimentacao, bem-estar, cuidados veterinarios, cumprimento da lei e proibicao de abandono ou maus-tratos."
    ]
  },
  {
    title: "5. Condutas Proibidas",
    paragraphs: [
      "E proibido fornecer informacoes falsas, praticar assedio, intimidacao, discriminacao, fraude ou uso ilicito da plataforma.",
      "Tambem e proibido publicar conteudo ilegal ou ofensivo, interferir no funcionamento do servico, criar contas para burlar regras e explorar animais para fins ilegais."
    ]
  },
  {
    title: "6. Protecao de Dados e Privacidade",
    paragraphs: [
      "A CenterPet trata dados pessoais conforme a LGPD e demais normas aplicaveis, conforme descrito na Politica de Privacidade.",
      "Os dados podem ser utilizados para viabilizar adocoes, conectar adotantes e ONGs, comunicacoes, melhoria da experiencia e prevencao de fraudes.",
      "O titular pode exercer direitos legais como acesso, correcao, portabilidade e exclusao, nos canais de contato da plataforma."
    ]
  },
  {
    title: "7. Propriedade Intelectual",
    paragraphs: [
      "A plataforma, seu design, funcionalidades, marcas e conteudos institucionais sao de titularidade da CenterPet ou licenciadores.",
      "Conteudos enviados pelo usuario permanecem de sua titularidade, mas o usuario concede licenca necessaria para operacao e promocao da plataforma."
    ]
  },
  {
    title: "8. Limitacao de Responsabilidade",
    paragraphs: [
      "A CenterPet atua como intermediadora entre adotantes e ONGs e nao garante aprovacao de adocoes.",
      "A plataforma e fornecida no estado em que se encontra. Na extensao permitida por lei, a CenterPet nao responde por danos indiretos, incidentais ou consequenciais."
    ]
  },
  {
    title: "9. Indenizacao",
    paragraphs: [
      "Voce concorda em indenizar a CenterPet por reclamacoes, perdas e custos decorrentes de uso indevido da plataforma, violacao destes Termos ou direitos de terceiros."
    ]
  },
  {
    title: "10. Disposicoes Gerais",
    paragraphs: [
      "Estes Termos sao regidos pelas leis brasileiras. Se alguma clausula for invalida, as demais permanecem validas.",
      "A eventual omissao de exercicio de direito pela CenterPet nao implica renuncia. A cessao destes Termos pela CenterPet pode ocorrer sem restricoes legais."
    ]
  },
  {
    title: "11. Contato",
    paragraphs: [
      "Para duvidas, solicitacoes e reclamacoes: contato@centerpet.com.br",
      "Ultima atualizacao dos Termos: 26 de maio de 2025."
    ]
  }
];

export default function TermsScreen({ navigation }) {
  return (
    <AppScreen navigation={navigation} activeTab="form">
      <ScrollView>
        <PageIntro title="Termos e Condicoes" subtitle="Uso da plataforma Center Pet" />
        <PinkCard>
          {sections.map((section) => (
            <View key={section.title} className="mb-4">
              <Text className="mb-2 text-base font-bold text-[#4C3A42]">{section.title}</Text>
              {section.paragraphs.map((paragraph, index) => (
                <Text key={`${section.title}-${index}`} className="mb-2 text-sm leading-6 text-[#3E3540]">
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
          <AppButton title="Aceitar Termos e Continuar" onPress={() => navigation.goBack()} />
        </PinkCard>
      </ScrollView>
    </AppScreen>
  );
}
