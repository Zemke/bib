package io.zemke.github.bib.http;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class BibberDummyImpl implements Bibber {

    @Override
    public MetaDto fetchMeta(String id) {
        String html = """
                <div>
                	<table class=\\"oclc-module-table\\" tabindex=\\"0\\" id=\\"1033156_grdViewMediumCopies\\">
                		<tr>
                			<th scope=\\"col\\" abbr=\\"Bücherei\\">Bücherei</th><th scope=\\"col\\" abbr=\\"Bereich\\">Bereich</th><th scope=\\"col\\" abbr=\\"Standorte\\">Standorte</th><th scope=\\"col\\" abbr=\\"Status\\">Status</th><th scope=\\"col\\" abbr=\\"Frist\\">Frist</th><th scope=\\"col\\" abbr=\\"Vorbestellungen\\">Vorbestellungen</th>
                		</tr><tr>
                			<td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Stadtteilbücherei:</span>
                				<span>Hauptstelle</span>
                			</td><td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Bereich:</span>
                				<span>Roman</span>
                			</td><td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Standorte:</span>
                				<span>Science fiction / 1. Obergeschoss</span>
                			</td><td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Status:</span>
                				<span>Entliehen</span>
                			</td><td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Frist:</span>
                				<span>16.09.2024</span>
                			</td><td>
                				<span class=\\"oclc-module-view-small oclc-module-label\\">Vorbestellungen:</span>
                				<span>0</span>
                			</td>
                		</tr>
                	</table>
                </div>
                """;
        return new MetaDto(true, html);
    }

    @Override
    public DetailDto fetchDetail(String id) {
        return new DetailDto("Vom Ende der Einsamkeit", "Wells, Benedict"); // 0980443
    }
}
