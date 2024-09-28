package io.zemke.github.bib;

import io.zemke.github.bib.entity.Avail;
import io.zemke.github.bib.entity.Book;
import io.zemke.github.bib.service.BookRepository;
import io.zemke.github.bib.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class MainController {

    private String biblink;

    private BookRepository bookRepository;

    private BookService bookService;

    @Autowired
    public MainController(@Value("${biblink}") String biblink,
                          BookRepository bookRepository,
                          BookService bookService) {
        this.biblink = biblink;
        this.bookRepository = bookRepository;
        this.bookService = bookService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("idOrLink", "");
        List<Book> books = bookRepository.findAll();
        books.sort(Comparator.comparing(Book::getCreated).reversed());
        books.parallelStream().filter(bookService::shouldRefresh).forEach(bookService::refresh);
        bookRepository.saveAll(books);
        Map<String, Map<String, List<Avail>>> booksToBooksByLoc = books.stream()
                .collect(Collectors.toMap(Book::getId, b ->
                        b.getAvails().stream()
                                .sorted()
                                .collect(Collectors.groupingBy(Avail::getLoc, LinkedHashMap::new, Collectors.toList()))
                ));
        model.addAttribute("avails", booksToBooksByLoc);
        model.addAttribute("books", books);
        model.addAttribute("biblink", biblink);
        return "index.html";
    }

    @PostMapping("/")
    public String index(@RequestParam String idOrLink, Model model) {
        String id;
        if (idOrLink.contains("http") || idOrLink.contains(".de") || idOrLink.contains("www") || idOrLink.contains("stadt")) {
            // link
            List<String> qq;
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

        var book = new Book(id);
        bookService.refresh(book);
        bookRepository.save(book);

        return index(model);
    }

    @PostMapping("/{id}")
    public String delete(@RequestParam String method, @PathVariable String id) {
        if ("delete".equals(method)) {
            var b = bookRepository.findById(id).orElseThrow();
            bookRepository.delete(b);
        }
        return "redirect:/";
    }
}

