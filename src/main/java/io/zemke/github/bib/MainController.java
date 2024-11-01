package io.zemke.github.bib;

import io.zemke.github.bib.entity.Avail;
import io.zemke.github.bib.entity.Book;
import io.zemke.github.bib.entity.Bookworm;
import io.zemke.github.bib.service.BookRepository;
import io.zemke.github.bib.service.BookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
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

    private final Logger logger = LoggerFactory.getLogger(MainController.class);

    @Autowired
    public MainController(@Value("${biblink}") String biblink,
                          BookRepository bookRepository,
                          BookService bookService) {
        this.biblink = biblink;
        this.bookRepository = bookRepository;
        this.bookService = bookService;
    }

    @GetMapping("/")
    public String index(Model model, @RequestParam(name = "buchwurm", required = false) Optional<String> bw) {
        Bookworm bookworm = getBookworm(bw);
        model.addAttribute("idOrLink", "");
        List<Book> books = bookRepository.findByBookworm(bookworm);
        books.sort(Comparator.comparing(Book::getCreated).reversed());
        books.parallelStream()
                .filter(bookService::shouldRefresh)
                .forEach(book -> {
                    try {
                        Thread.sleep((long) (1000 * (new Random().nextDouble() + .5)));
                    } catch (InterruptedException e) {
                        throw new RuntimeException("interrupted during request spreading", e);
                    }
                    try {
                        bookService.refresh(book);
                    } catch (Exception e) {
                        logger.error(e.getMessage(), e);
                    }
                });
        bookRepository.saveAll(books);
        Map<String, Map<String, List<Avail>>> booksToBooksByLoc = books.stream()
                .collect(Collectors.toMap(Book::getId, b ->
                        b.getAvails().stream()
                                .sorted()
                                .collect(Collectors.groupingBy(Avail::getLoc, LinkedHashMap::new, Collectors.toList()))
                ));
        model.addAttribute("avails", booksToBooksByLoc);
        model.addAttribute("collapse", booksToBooksByLoc.size() > 4 && bookworm != Bookworm.FLORI);
        model.addAttribute("books", books);
        model.addAttribute("biblink", biblink);
        model.addAttribute("bookworm", bookworm.name());
        return "index.html";
    }

    @PostMapping("/")
    public String index(@RequestParam String idOrLink,
                        @RequestParam(defaultValue = "create") String method,
                        @RequestParam("buchwurm") String bw,
                        Model model) {
        Bookworm bookworm = getBookworm(Optional.of(bw));

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
                return index(model, Optional.of(bookworm.name()));
            }
            id = qq.get(idxId + 1);
        } else {
            id = idOrLink;
        }

        if ("delete".equals(method)) {
            var b = bookRepository.findById(id).orElseThrow();
            bookRepository.delete(b);
            return "redirect:/";
        } else if ("create".equals(method)) {
            if (bookRepository.findById(id).isPresent()) {
                return index(model, Optional.of(bookworm.name()));
            }
            var book = new Book(id, bookworm);
            bookService.refresh(book);
            bookRepository.save(book);
        }

        return index(model, Optional.of(bookworm.name()));
    }

    private static Bookworm getBookworm(Optional<String> bw) {
        Bookworm bookworm;
        try {
            bookworm = bw.map(String::toUpperCase).map(Bookworm::valueOf).orElse(Bookworm.LEA);
        } catch (Exception ignore) {
            bookworm = Bookworm.LEA;
        }
        return bookworm;
    }
}
