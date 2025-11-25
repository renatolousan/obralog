# Dashboard de Indicadores

Esta página exibe indicadores de analytics baseados nos endpoints do backend.

## Como usar

A página de dashboard deve ser acessada com um parâmetro `developmentId` na URL:

```
/pages/dashboard?developmentId=SEU_DEVELOPMENT_ID
```

## Componentes

### 1. SuppliersIndicator

- **Gráfico**: Bar Chart mostrando os 5 fornecedores com mais feedbacks
- **Ranking**: Lista scrollável com todos os fornecedores ordenados por número de feedbacks
- **Dados adicionais**: CNPJ do fornecedor

### 2. InstallersIndicator

- **Gráfico**: Doughnut Chart mostrando distribuição de feedbacks por instalador
- **Ranking**: Lista scrollável com todos os instaladores ordenados por número de feedbacks
- **Dados adicionais**: CPF do instalador

### 3. BuildingsIndicator

- **Gráfico**: Line Chart mostrando tendência de feedbacks por prédio
- **Ranking**: Lista scrollável com todos os prédios ordenados por número de feedbacks

### 4. ItemsIndicator

- **Gráfico**: Pie Chart mostrando distribuição de feedbacks por item
- **Ranking**: Lista scrollável com todos os itens ordenados por número de feedbacks
- **Dados adicionais**: Nome do fornecedor

## Layout

- **Desktop**: Grid 2x2 (4 indicadores ocupando 1/4 da página cada)
- **Mobile**: Grid 1x4 (indicadores empilhados verticalmente)
- **Altura**: Altura total da viewport menos header
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## Funcionalidades

- ✅ Carregamento assíncrono dos dados
- ✅ Estados de loading, erro e dados vazios
- ✅ Botão para voltar para /pages/developments
- ✅ Gráficos interativos com Chart.js
- ✅ Rankings scrolláveis
- ✅ Seção de sugestões (estática por enquanto)
- ✅ Design responsivo
- ✅ Tratamento de erros

## Dependências

- `chart.js`: Biblioteca de gráficos
- `react-chartjs-2`: Wrapper React para Chart.js
- `next/navigation`: Para navegação entre páginas

## Endpoints utilizados

- `GET /analytics/suppliers/incidents`
- `GET /analytics/installers/incidents`
- `GET /analytics/buildings/incidents`
- `GET /analytics/items/incidents`

Todos os endpoints esperam `developmentId` no body da requisição.

