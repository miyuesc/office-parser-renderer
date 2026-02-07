import { ChartParser } from '../parser/ChartParser';
import { ChartType } from '../model/IChartData';

// Mock XML Content
const mockChartXml = `
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <c:chart>
    <c:plotArea>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:v>Series 1</c:v>
          </c:tx>
          <c:spPr>
            <a:solidFill>
              <a:srgbClr val="FF0000"/>
            </a:solidFill>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:strCache>
                <c:pt idx="0"><c:v>Cat A</c:v></c:pt>
                <c:pt idx="1"><c:v>Cat B</c:v></c:pt>
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:numCache>
                <c:pt idx="0"><c:v>10</c:v></c:pt>
                <c:pt idx="1"><c:v>20</c:v></c:pt>
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>

        <c:axId val="123"/>
        <c:axId val="456"/>
      </c:barChart>
      
      <c:catAx>
        <c:axId val="123"/>
        <c:axPos val="b"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="456"/>
        <c:axPos val="l"/>
      </c:valAx>

    </c:plotArea>
  </c:chart>
</c:chartSpace>
`;

describe('ChartParser', () => {
  it('should parse basic bar chart', () => {
    const parser = new ChartParser();
    const result = parser.parse(mockChartXml);

    expect(result).not.toBeNull();
    expect(result?.type).toBe(ChartType.BAR);
    expect(result?.categories).toEqual(['Cat A', 'Cat B']);
    expect(result?.series.length).toBe(1);

    const series = result!.series[0];
    expect(series.name).toBe('Series 1');
    expect(series.data).toEqual([10, 20]);
    expect(series.fillColor).toBe('#FF0000');
  });
});
