      const result = await response.json();

      if (result.success) {
        // Salvar ID da análise para usar na página de resultados
        localStorage.setItem('currentAnalysisId', result.analysisId);
        // Salvar o resultado da análise no localStorage
        localStorage.setItem('analysisResult', JSON.stringify(result.analysis));
        router.push('/results');
      } else {
        alert('Erro ao processar análise. Tente novamente.');
      }