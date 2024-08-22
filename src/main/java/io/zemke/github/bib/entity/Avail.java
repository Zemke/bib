package io.zemke.github.bib.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
public class Avail {

    @Id
    @GeneratedValue
    private Long id;

    private String loc;

    private String pos;

    private LocalDate rent;

    private int pre;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getLoc() {
        return loc;
    }

    public void setLoc(String loc) {
        this.loc = loc;
    }

    public String getPos() {
        return pos;
    }

    public void setPos(String pos) {
        this.pos = pos;
    }

    public LocalDate getRent() {
        return rent;
    }

    public void setRent(LocalDate rent) {
        this.rent = rent;
    }

    public int getPre() {
        return pre;
    }

    public void setPre(int pre) {
        this.pre = pre;
    }

    @Override
    public String toString() {
        return "Avail{" +
                "id='" + id + '\'' +
                ", loc='" + loc + '\'' +
                ", pos='" + pos + '\'' +
                ", rent=" + rent +
                ", pre=" + pre +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Avail avail = (Avail) o;
        return id.equals(avail.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
