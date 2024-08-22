package io.zemke.github.bib.http;

public interface Bibber {
    MetaDto fetchMeta(String id);

    DetailDto fetchDetail(String id);
}
