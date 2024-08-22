package io.zemke.github.bib;

import io.zemke.github.bib.http.Bibber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;

@Controller
public class MainController {

    private BookRepository bookRepository;
    private Bibber bibber;

    @Autowired
    public MainController(BookRepository bookRepository, Bibber bibber) {
        this.bookRepository = bookRepository;
        this.bibber = bibber;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("idOrLink", "");
        model.addAttribute("books", bookRepository.findAll());
        return "index.html";
    }

    @PostMapping("/")
    public String index(@RequestParam String idOrLink, Model model) {
        String id;
        if (idOrLink.contains("http") || idOrLink.contains(".de") || idOrLink.contains("www") || idOrLink.contains("stadt")) {
            // link
            List<String> qq = null;
            try {
                qq = Arrays.asList(new URL(idOrLink).getQuery().split("="));
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }
            int idxId = qq.indexOf("id");
            if (qq.size() < 2 || idxId < 0) {
                return index(model);
            }
            id = qq.get(idxId + 1);
        } else {
            id = idOrLink;
        }

        if (bookRepository.findById(id).isPresent()) {
            return index(model);
        }

        var meta = bibber.fetchMeta(id);
        var detail = bibber.fetchDetail(id);
        var book = new Book(id).setHtml(meta.html()).setAvail(meta.avail()).setName(detail.name()).setAuthor(detail.author());
        bookRepository.save(book);
        return index(model);
    }
}

