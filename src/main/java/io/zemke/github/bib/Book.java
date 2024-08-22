package io.zemke.github.bib;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Book {

    @Id
    private String id;

    private String name;

    private Boolean avail;

    @Lob
    private String html;

    @Lob
    private String image;

    public Book() {
    }

    public Book(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Book setName(String name) {
        this.name = name;
        return this;
    }

    public Boolean getAvail() {
        return avail;
    }

    public Book setAvail(Boolean avail) {
        this.avail = avail;
        return this;
    }

    public String getHtml() {
        return html;
    }

    public Book setHtml(String html) {
        this.html = html;
        return this;
    }

    public String getImage() {
        return image;
    }

    public Book setImage(String image) {
        this.image = image;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Book book = (Book) o;

        return id.equals(book.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "Book{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", html='" + html + '\'' +
                ", avail='" + avail + '\'' +
                '}';
    }

}
