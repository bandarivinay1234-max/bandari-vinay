import { TopicKey } from './types';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: TopicKey;
  type: 'multiple' | 'coding';
  initialCode?: string;
  testCasePrompt?: string;
  benchmarkCode?: string;
}

// Map day numbers (1 to 30) of the Python Practice Plan to their topics
export function getCategoryForDay(day: number): TopicKey {
  if (day <= 3) return 'python';            // Days 1-3: Tuple
  if (day <= 6) return 'pandas';            // Days 4-6: Set (using 'pandas' category tab)
  if (day <= 10) return 'numpy';            // Days 7-10: Dictionary (using 'numpy' category tab)
  if (day <= 20) return 'machineLearning';  // Days 11-20: OOPs (using 'machineLearning' category tab)
  if (day <= 24) return 'dl';               // Days 21-24: Exception Handling (using 'dl' category tab)
  if (day <= 27) return 'nlp';              // Days 25-27: Modules & Packages (using 'nlp' category tab)
  return 'genai';                           // Days 28-30: Mixed Interview Questions (using 'genai' category tab)
}

// Readable titles for topics in the 30-Day Python Practice Plan
export function getSubTopicForDay(day: number): string {
  const topics: Record<number, string> = {
    1: "Tuple Basics, Packing & Expression Unpacking",
    2: "Tuple Index Offsets, Iterations & Memory Layouts",
    3: "Tuple Hashability, Nested States & namedtuple structures",
    4: "Set Basics: Unique Elements & Hashable Collections",
    5: "Set Algebra: Math Union, Intersections & Subsets",
    6: "Frozenset Immutability & Set Comprehensions",
    7: "Dictionary Keys, Value Lookups & default fallbacks",
    8: "Dictionary Dynamic Views, Mutability & Item updates",
    9: "Dictionary Comprehensions & Key-Filtering Pipelines",
    10: "Defaultdicts, OrderedDict, and Collection Containers",
    11: "Classes, Objects Instantiation & self Receiver",
    12: "Object States, Instance Methods & Custom String Dunders",
    13: "Encapsulation, Underscore Scoping & property Guards",
    14: "Single Inheritance, Subclassing & Parent initializers",
    15: "Multiple Inheritance, MRO & Diamond hierarchy paths",
    16: "Polymorphism, Overrides & Duck-typing Protocols",
    17: "Classmethods factories versus Staticmethods utilities",
    18: "ABC Abstract Base Classes & Interface Restrictions",
    19: "Operator Overloading: Numeric & Comparative Dunders",
    20: "Dunder Slots Memory optimization & dynamic descriptors",
    21: "Try-Except Errors handling, finally closures & else blocks",
    22: "Custom Exception classes, Assertions & raise from Chaining",
    23: "Context Managers, magic hooks __enter__ and __exit__",
    24: "Resilient error propagation & traceback inspection",
    25: "Absolute vs Relative imports & Package __init__ architecture",
    26: "Standard Libs: OS/Sys registers, JSON parsing & regex matches",
    27: "Pip dependencies locking & Virtualenv namespace Isolation",
    28: "Garbage collection, reference counts & generator memory footprints",
    29: "Built-in Timsort algorithm complexity & dynamic hash lookups",
    30: "Asynchronous loops, Closures scopes encapsulation & Type hints"
  };
  return topics[day] || "Advanced Python concepts & optimization";
}

// High-quality collection database of unique multiple-choice questions for Day 1 to 30 (5 per day)
function getSpecificMCQ(day: number, qIndex: number, subtopic: string): {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
} {
  // We can construct high-precision questions for each of the 30 days
  const topicName = getSubTopicForDay(day);
  const correctAnswerIndex = (day * 3 + qIndex) % 4; // Deterministic index

  let question = "";
  let options: string[] = [];
  let explanation = "";

  // Days 1-3: Tuples
  if (day <= 3) {
    if (qIndex === 1) {
      question = `On ${topicName}, what is the fundamental memory advantage of tuple structures in CPython compared to dynamic list arrays?`;
      options = [
        "Tuples are statically preallocated with a single, compact chunk of memory, reducing pointer-indirection and garbage collector sweeps.",
        "Tuples automatically compile down to direct microprocessor machine registers upon executing simple definitions.",
        "Tuples utilize localized compression pipelines which scale linear lookup searching speeds to logarithmic limits.",
        "Tuples store elements strictly as dynamic C-style links, allowing instant O(1) resizing at the tail position."
      ];
      explanation = "Tuples are immutable sequence types that have a fixed, optimized memory layout. Lists require dynamic dynamic-resizing over-allocations, consuming more memory overhead.";
    } else if (qIndex === 2) {
      question = `When performing tuple unpacking in a statement like 'a, *b, c = some_iterable', how does CPython handle assignment boundaries?`;
      options = [
        "The variable 'b' is assigned a list of all elements between indices of 'a' and 'c', including empty lists if boundaries are tight.",
        "CPython asserts that 'b' must hold exactly one item, throwing a runtime ValueError if excess elements remain.",
        "Unpacking automatically splits variables into immutable dictionary structures matching active indexes.",
        "The star operator triggers a concurrent loop execution that evaluates items in parallel threads."
      ];
      explanation = "Extended unpacking allows binding middle items to a starred target. It compiles to list arrays, resolving the remainder cleanly.";
    } else if (qIndex === 3) {
      question = `Which of the following elements can be used as valid keys in a Python dictionary under '${topicName}' specifications?`;
      options = [
        "A tuple containing only strings, integers, or other nested tuples.",
        "A tuple containing a key list of coordinates representing indices.",
        "Any tuple, regardless of whether its individual elements are mutable or immutable.",
        "Only flat tuples consisting exclusively of single-character hexadecimal values."
      ];
      explanation = "A dictionary key must be hashable. A tuple is only hashable (and thus suitable as a key) if all of its nested objects are also hashable.";
    } else if (qIndex === 4) {
      question = `What is the immediate consequence of executing an expression like 'my_tuple[0] += [1, 2]' where index 0 points to a mutable list?`;
      options = [
        "The list is modified in-place, but a TypeError exception is still raised due to the tuple's immutability validator.",
        "The list is modified silently without raising any exceptions, because lists are mutable pointers.",
        "CPython raises a compile-time SyntaxError which halts execution before running any statement.",
        "The tuple creates an instant copy of itself with the modified list coordinates, replacing the pointer assignment."
      ];
      explanation = "An in-place operator like '+=' performs standard list updates first, then attempts assignment. Because it tries to mutate index 0 of the immutable tuple, a TypeError is raised after the update has already succeeded in-place.";
    } else {
      question = `What is the primary feature of Python's 'collections.namedtuple' compared to standard tuples under '${topicName}'?`;
      options = [
        "It generates subclass sequences selectable via human-readable attribute names without losing index-based accessibility or immutability.",
        "It allocates global reference mutex locks around elements to ensure strict multi-thread concurrency safety.",
        "It compiles standard numeric values to hexadecimal representations to reduce storage allocation footprints.",
        "It allows elements to represent mutable parameters while throwing no errors during key changes."
      ];
      explanation = "namedtuples assign names to elements, facilitating readable properties retrieval while retaining standard index accesses and standard immutable performance.";
    }
  }
  // Days 4-6: Set
  else if (day <= 6) {
    if (qIndex === 1) {
      question = `Under Set algebra and '${topicName}', how does CPython achieve average O(1) time complexity for membership looks (via 'in')?`;
      options = [
        "By implementing dynamic Hash tables where values are converted to hashes, locating elements directly via index-clash resolvers.",
        "By sorting elements in background threads, enabling high-performance binary search trees.",
        "By compressing elements to flat continuous arrays and scanning them with vectorized assembly code loops.",
        "By enforcing strict memory page locks which map direct hardware pointers to set identifiers."
      ];
      explanation = "Python sets are built on dynamic hash tables, allowing O(1) average lookup times. They compute hashes to quickly discover indexes.";
    } else if (qIndex === 2) {
      question = `What is the key functional difference between executing Set '.discard(x)' versus '.remove(x)' for missing values?`;
      options = [
        "'.discard(x)' ignores missing keys silently, whereas '.remove(x)' raises a standard KeyError exception if elements are missing.",
        "'.discard(x)' empties the entire set workspace, while '.remove(x)' deletes only the target point.",
        "'.discard(x)' takes logarithmic O(log N) processing time, while '.remove(x)' works in constant time.",
        "'.discard(x)' translates elements to string representations, while '.remove(x)' keeps standard types."
      ];
      explanation = ".remove() fires standard KeyError exceptions on missing values to alert programmers, while .discard() handles omission safely.";
    } else if (qIndex === 3) {
      question = `Which restriction governs the type of objects that can be added as elements to standard sets under '${topicName}'?`;
      options = [
        "The added objects must be hashable, meaning they possess a stable hash value during their lifecycles and support equality comparisons.",
        "The added elements can only represent flat, low-level scalar types like integers and floats.",
        "All elements have to share exact memory allocations with the active module namespace.",
        "Elements must be declared inside frozen classes featuring custom __slots__ definitions."
      ];
      explanation = "Elements in sets must be hashable to allow internal hash-map calculations. Lists, dicts, and sets are unhashable, triggering TypeErrors.";
    } else if (qIndex === 4) {
      question = `How does standard Set creation like '{x for x in list_data}' (set comprehension) avoid duplicates?`;
      options = [
        "CPython evaluates and hashes each element during iteration, discarding any inputs that resolve to pre-existing hash indexes.",
        "Comprehensions automatically raise standard ValueErrors when they encounter duplicate values.",
        "It compiles elements into nested list arrays and runs a fast Timsort pass to strip identical elements.",
        "The interpreter delegates duplicate evaluation to standard garbage collection sweeps, removing items later."
      ];
      explanation = "Set comprehensions build set tables iteratively. Since set entries must be completely unique, clashing hashes discard duplicate candidate keys.";
    } else {
      question = `What are the core capabilities of standard 'frozenset' structures under '${topicName}'?`;
      options = [
        "Frozensets are completely immutable and hashable, allowing them to be nested inside other active sets or dictionaries keys.",
        "Frozensets prevent any dynamic module imports while active inside local scopes.",
        "Frozensets utilize specialized concurrent locking models to optimize multiprocessing loops.",
        "Frozensets compress alphanumeric symbols into small hexadecimal byte sequences."
      ];
      explanation = "frozenset is an immutable, hashable set type. Because it is hashable, it can be added to sets or utilized as dictionary keys safely.";
    }
  }
  // Days 7-10: Dictionaries
  else if (day <= 10) {
    if (qIndex === 1) {
      question = `When searching dictionaries like 'my_dict.get(key, default_val)', how does Python optimize lookup efficiency under '${topicName}'?`;
      options = [
        "It queries the underlying hash index directly in O(1) average time, returning 'default_val' if keys don't exist.",
        "It iterates over keys sequentially up to the first key clash before returning dynamic fallbacks.",
        "It launches an asynchronous lookup thread which scans value arrays to prevent blockages.",
        "It recompiles the dictionary structure into a sorted tree array to find keys."
      ];
      explanation = ".get() provides a clean fallback lookup, query matching via hash tables without raising standard KeyError exceptions.";
    } else if (qIndex === 2) {
      question = `Since modern Python 3.7+, what are the deterministic insertion constraints for standard dictionary objects?`;
      options = [
        "Dictionaries maintain insertion-order, meaning iterating over items returns elements in the exact order they were declared.",
        "Dictionaries preserve sorted alpha-numeric alignments on keys to facilitate faster evaluations.",
        "Dict objects are strictly locked from mutable additions unless instantiated via collections.OrderedDict.",
        "Keys must fit contiguous sequential indices starting from 0 to preserve storage boundaries."
      ];
      explanation = "Python 3.7+ dictionaries officially guarantee insertion-order preservation through an optimized compact dual-array hash structure.";
    } else if (qIndex === 3) {
      question = `When executing 'for k, v in my_dict.items()', what does CPython yield under '${topicName}' dynamic views constraints?`;
      options = [
        "A dynamic interface view mapping existing keys, reflecting immediate changes made to the dictionary in-place.",
        "An isolated, static list copy containing frozen copies of all keys and values snapshot values.",
        "A generator sequence where elements are deleted from the host memory table upon retrieval.",
        "An immutable copy of active dictionary variables mapped to local namespace structures."
      ];
      explanation = "Dictionary views (.keys(), .values(), .items()) are dynamic monitors, automatically displaying any modifications made to dictionaries.";
    } else if (qIndex === 4) {
      question = `How does Python's 'collections.defaultdict' handle missing keys comparison with standard dictionaries?`;
      options = [
        "defaultdict initializes a custom factory solver (e.g. callable list/set/int) to create default entries for missing keys.",
        "defaultdict raises warnings in system console pipelines before returning standard None values.",
        "defaultdict forces key structures to inherit from abstract base directories to prevent null entries.",
        "defaultdict blocks missing lookups entirely, turning off any key updates while executing."
      ];
      explanation = "defaultdict overrides __missing__(key) to automatically build default entries using its default_factory callback.";
    } else {
      question = `What is the unique capabilities configuration of 'collections.ChainMap' under '${topicName}'?`;
      options = [
        "It bundles multiple dictionaries into a single, logical unified mapping, searching keys sequentially through lists.",
        "It links dictionary nodes concurrently, performing thread synchronization on key changes.",
        "It creates high-resolution graphic vector grids mapping values associations.",
        "It hashes nested records to allow keys to references elements of duplicate hashes."
      ];
      explanation = "ChainMap groups dictionaries in single logical maps. It evaluates looks-ups from left to right, matching values efficiently without duplicating structures.";
    }
  }
  // Days 11-20: OOPs
  else if (day <= 20) {
    if (qIndex === 1) {
      question = `Under OOPs rules on '${topicName}', what is the precise purpose of the 'self' keyword inside class methods?`;
      options = [
        "It is standard parameter referencing the specific instance object being edited, allowing access to instance attributes and methods.",
        "It is built-in compiler switch which enforces static variable scopes inside subclass hierarchies.",
        "It initializes custom memory threads to prevent attribute collisions globally across classes.",
        "It is dynamic instruction variable mapping parent initializations to garbage collection counters."
      ];
      explanation = "'self' represents class instance targets. It binds methods actions directly onto target objects schemas.";
    } else if (qIndex === 2) {
      question = `What is the core functional difference between implementing '__str__' versus '__repr__' dunder methods?`;
      options = [
        "'__str__' is optimized for end-user readability, while '__repr__' is designed for unambiguous developer representations (and should be valid Python code).",
        "'__str__' converts class values to ASCII, while '__repr__' outputs binary representations to registries.",
        "'__str__' runs in O(1) static execution limits, while '__repr__' is slow and unthreaded.",
        "'__str__' can only output string objects, while '__repr__' is free to return dictionary variables."
      ];
      explanation = "__repr__ delivers unambiguous debugger representations, typically matching constructs inputs, while __str__ targets raw readable string formats.";
    } else if (qIndex === 3) {
      question = `When utilizing subclass hierarchies under '${topicName}', what role does 'super()' initialize?`;
      options = [
        "It returns proxy objects delegating method calls to parent classes based on Method Resolution Order (MRO).",
        "It terminates subclass thread bounds to prevent memory allocation collisions with base classes.",
        "It forces parent definitions to bypass class-level attributes, compiling elements to local frames.",
        "It imports global module directories inside localized object namespaces sequentially."
      ];
      explanation = "super() refers to parents classes under MRO rules, triggering correct chain setups in multiple inheritance environments.";
    } else if (qIndex === 4) {
      question = `Under multiple inheritance pipelines, how does CPython evaluate properties finding path via Method Resolution Order (MRO)?`;
      options = [
        "It uses the C3 Linearization algorithm to build a deterministic, consistent lookup order while preserving base class precedence.",
        "It runs random thread-locks searches to resolve access parameters.",
        "It searches subclass hierarchies from right to left, prioritizing older declarations over children.",
        "It throws standard MROExceptions if two child namespaces share duplicate attribute labels."
      ];
      explanation = "CPython resolves multiple inheritance hierarchies deterministically using the C3 Linearization algorithm (viewable via Class.mro()).";
    } else {
      question = `How does using '__slots__' inside custom classes optimize memory constraints under '${topicName}'?`;
      options = [
        "It replaces instance attributes dictionaries (__dict__) with compact flat arrays, preventing arbitrary attributes creation.",
        "It locks class methods in localized CPU registries to cut lookup access times.",
        "It compiles standard numeric attributes to integer matrices, bypassing garbage collection cycles.",
        "It enforces interfaces validations on subclass functions parameters."
      ];
      explanation = "__slots__ restricts instance properties to predefined keys. Under slots rules, CPython disables instance dict allocations, significantly saving memory structures.";
    }
  }
  // Days 21-24: Exception Handling
  else if (day <= 24) {
    if (qIndex === 1) {
      question = `Under exception handling and '${topicName}', when does CPython execute the 'else' block inside a try-except structure?`;
      options = [
        "Immediately after the try block completes successfully without raising any exceptions.",
        "Only when the except block captures matching TypeError or NameError anomalies.",
        "Right before the finally block triggers during thread cleanup procedures.",
        "Whenever unhandled exception parameters crash active interpreter tasks."
      ];
      explanation = "The try-except 'else' block runs only if no exception is raised, offering clean isolated separation of success logic.";
    } else if (qIndex === 2) {
      question = `When creating custom exceptions, what is the industry standard inheritance pattern under '${topicName}'?`;
      options = [
        "Inheriting from the standard 'Exception' class rather than 'BaseException', keeping system-level exceptions like SystemExit unhandled.",
        "Inheriting directly from custom metaclases to bypass typical namespace bindings.",
        "Subclassing lists or sets structures to capture warning sequences dynamically.",
        "Inheriting from the lowest available hardware interface profiles."
      ];
      explanation = "Custom exceptions should subclass Python's built-in 'Exception'. 'BaseException' handles system exits or key interrupts that should not be caught.";
    } else if (qIndex === 3) {
      question = `Under exception chaining, what is the effect of writing 'raise CustomException() from original_error'?`;
      options = [
        "It attaches the original stack trace via the '__cause__' attribute, providing clear, trace-linked diagnostic chaining.",
        "It blocks original stack logs completely to save file space on disk.",
        "It compiles nested errors to dynamic list models mapping failure boundaries.",
        "It translates local parameters to global coordinates to trigger container reboots."
      ];
      explanation = "'raise X from Y' sets Y as the cause of X. This maintains clean connected traceback contexts throughout diagnostic files.";
    } else if (qIndex === 4) {
      question = `In custom context managers, what is the precise protocol triggered when '__exit__' returns a truthy value like True?`;
      options = [
        "It suppresses the raised exception, preventing it from propagating further up the execution stack.",
        "It forces the interpreter to re-raise exception contexts, crashing the parent container loop.",
        "It records errors inside active directories before initiating instant thread restarts.",
        "It deletes all transient variables allocated inside try-except execution blocks."
      ];
      explanation = "If __exit__ returns True, it tells CPython to ignore the exception. Returning False yields typical propagation rules.";
    } else {
      question = `Which built-in exception class serves as the ultimate parent for all Python error structures, including system interrupts?`;
      options = [
        "BaseException",
        "Exception",
        "SystemError",
        "RuntimeError"
      ];
      explanation = "BaseException is the base class for all built-in exceptions. Standard program exceptions inherit from its subclass Exception.";
    }
  }
  // Days 25-27: Modules & Packages
  else if (day <= 27) {
    if (qIndex === 1) {
      question = `When executing Python modules, what is the precise roles of the '__init__.py' file in package directories?`;
      options = [
        "It marks directories as importable Python packages, configuring namespace setups & exposed API structures on import.",
        "It compiles internal functions to binary targets to speed up script boots.",
        "It manages directory folder creations inside physical docker filesystems.",
        "It clears standard cache records during dynamic modules updates."
      ];
      explanation = "__init__.py initializes package structures, setting exports via '__all__' and managing namespace parameters.";
    } else if (qIndex === 2) {
      question = `Under standard modules lookups and '${topicName}', where does the interpreter seek packages first?`;
      options = [
        "In the current working folder directory where the main executing script was launched, followed by 'sys.path'.",
        "Inside compiled static registry directories allocated in local compiler pools.",
        "Directly inside standard pipelines connected to external pip repositories.",
        "Directly inside the global OS root directory folder hierarchy."
      ];
      explanation = "Python imports prioritize the active execution directory path, followed by paths in 'sys.path' directories (stdlib, then site-packages).";
    } else if (qIndex === 3) {
      question = `What is the core functional difference between absolute imports and relative imports in modular layouts?`;
      options = [
        "Absolute imports specify the complete path from the project root, while relative imports use leading dots ('.') from the active module's location.",
        "Absolute imports scale faster, whereas relative imports require multi-thread modules setup.",
        "Absolute imports bypass system caching, while relative imports lock files from modification.",
        "Absolute imports can only access packages residing in site-packages coordinates."
      ];
      explanation = "Absolute imports specify full path chains from roots. Relative imports use '.' indicators relative to package namespaces.";
    } else if (qIndex === 4) {
      question = `How does Python's standard 'sys.modules' dictionary help optimize the module importing pipeline?`;
      options = [
        "It caches pre-loaded modules, preventing expensive filesystem lookups and re-execution of modules on subsequent imports.",
        "It maps internal C files variables directly inside the current session namespaces.",
        "It secures modules with dynamic locks during concurrent read/write queries.",
        "It dumps dynamic package references to active memory buffers to bypass imports entirely."
      ];
      explanation = "sys.modules caches loaded packages. Subsequent imports check this dictionary first, preventing double initialization.";
    } else {
      question = `What is the precise purpose of standard packages dependency lockfiles like 'requirements.txt' or Pipfiles?`;
      options = [
        "Ensuring deterministic package versions installations, maintaining identical environments across local dev & production servers.",
        "Locking host C compilers to prevent custom modules modifications.",
        "Encrypting source script codes before distribution to third-party clients.",
        "Structuring database schemas alignments before launching active API routes."
      ];
      explanation = "Dependencies lockfiles enforce standard versions bounds, ensuring code behavior behaves identical across local and cloud servers.";
    }
  }
  // Days 28-30: Mixed Interview Questions
  else {
    if (qIndex === 1) {
      question = `Under CPython's low-level memory rules, how does the reference-counting garbage collector handle self-referencing cyclic loops?`;
      options = [
        "A cyclic garbage detector runs in the background, identifying self-referencing isolated clusters and purging them periodically.",
        "The reference count drops to 1, locking the circular memory cluster from allocation indefinitely.",
        "It crashes the interpreter, raising OutOfMemory errors unless manual deletions are called.",
        "It transforms dynamic elements to constant variables to bypass memory leaks."
      ];
      explanation = "While reference counts catch active deletions, self-referencing cyclic loops require the background cyclic garbage detector to clear memory.";
    } else if (qIndex === 2) {
      question = `What is the average and worst-case time complexity of Python's built-in sorting method (Timsort)?`;
      options = [
        "Average O(N log N), Worst-case O(N log N), Best-case O(N) linear time.",
        "Average O(N log N), Worst-case O(N^2), Best-case O(1) constant time.",
        "Average O(N^2), Worst-case O(N^2), Best-case O(N log N) sorted runs.",
        "Average O(N), Worst-case O(N log N), Best-case O(N) linear space."
      ];
      explanation = "Timsort (Python's native sort) is a hybrid stable sorting algorithm. It runs in O(N) best cases, O(N log N) average cases, and O(N log N) worst cases.";
    } else if (qIndex === 3) {
      question = `How do generator expressions vary from list comprehensions in runtime memory and execution footprints?`;
      options = [
        "Generator expressions evaluate elements lazily (one-at-a-time) using constant O(1) memory, while list comprehensions build full linear lists in memory.",
        "Generators are slower because they require constant multi-threaded locking routines.",
        "Generators compile to immutable packages, while lists rely on unindexed list dynamic mappings.",
        "Generators throw automatic StopIteration warnings that halt dynamic loops execution."
      ];
      explanation = "Generator expressions yield items lazily, keeping memory at O(1) scales, while lists load all elements instantly, taking O(N) space.";
    } else if (qIndex === 4) {
      question = `Under asynchronous Python, what is the core role of the Event Loop inside 'asyncio' models?`;
      options = [
        "It handles active co-routine triggers, scheduling tasks and switching execution focus during non-blocking socket wait states.",
        "It runs multiple threads parallelizing calculations across multiple hardware cores safely.",
        "It locks mutable variables to prevent write conflicts across async processes namespaces.",
        "It translates Python statements to native client browser JavaScript handles."
      ];
      explanation = "The AsyncIO event loop coordinates non-blocking task executions on a single thread, switching context when tasks suspend via await commands.";
    } else {
      question = `How does a closures function scope maintain access to variables in outer enclosing functions after execution finishes?`;
      options = [
        "Via 'cell' structures in the inner function's '__closure__' attribute, which store active reference bindings to non-local variables.",
        "By duplicating outer parameters to global dynamic dictionaries namespaces.",
        "By locking execution threads to prevent variable definitions from getting garbage collected.",
        "By converting text and variable names to immutable hash keys mapping definitions."
      ];
      explanation = "Closures preserve non-local variables references inside '__closure__' cell objects, allowing function copies to access context variables.";
    }
  }

  // Adjust correct options to match deterministic correct index
  const originalCorrectOption = options[0];
  const originalWrongOptions = options.slice(1);
  const adjustedOptions = [...originalWrongOptions];
  adjustedOptions.splice(correctAnswerIndex, 0, originalCorrectOption);

  return {
    question,
    options: adjustedOptions,
    correctAnswerIndex,
    explanation
  };
}

// Procedural generator to construct 5 unique coding sandboxes for any day (guaranteeing exact checker parameter matching)
function getSpecificCodingChallenge(day: number, category: TopicKey, subtopic: string, cIndex: number): {
  question: string;
  testCasePrompt: string;
  initialCode: string;
  benchmarkCode: string;
  explanation: string;
} {
  let questionText = "";
  let testCasePrompt = "";
  let initialCode = "";
  let benchmarkCode = "";
  let explanation = "";

  const slug = subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  // Challenge 1 (Index 5 in questions list) must use id() or is, and set/seen
  if (cIndex === 1) {
    questionText = `Reference Identity Auditor (Day ${day} Challenge)`;
    testCasePrompt = `Implement a custom tracking function 'audit_${slug}_references_day${day}(elements_list)' tailored for '${subtopic}'. Return a boolean indicating if elements inside have duplicate memory address references using Python's 'id()' or 'is' operators. Maintain a lookup set called 'seen_ids = set()' to perform verification in O(1) checks.`;
    initialCode = `def audit_${slug}_references_day${day}(elements_list):\n    # TODO Verify memory identity overlap\n    # Initialize seen_ids = set() and check id() or is references\n    pass`;
    benchmarkCode = `def audit_${slug}_references_day${day}(elements_list):\n    seen_ids = set()\n    for row in elements_list:\n        if isinstance(row, list) or isinstance(row, tuple):\n            for item in row:\n                if id(item) in seen_ids:\n                    return True\n                seen_ids.add(id(item))\n        else:\n            if id(row) in seen_ids:\n                return True\n            seen_ids.add(id(row))\n    return False`;
    explanation = `Using 'id()' detects object memory address duplicates over active parameters of '${subtopic}'.`;
  }
  // Challenge 2 (Index 6) must use yield
  else if (cIndex === 2) {
    questionText = `Lazy Stream Generator (Day ${day} Challenge)`;
    testCasePrompt = `Write a Python generator 'stream_${slug}_items_day${day}(items_iterator)' to yield parsed target records representation from records containing '${subtopic}' keywords. Yield active dict objects in the format: { 'topic': '${subtopic}', 'message': item } using the 'yield' statement, only for records containing the keyword 'ERROR'.`;
    initialCode = `def stream_${slug}_items_day${day}(items_iterator):\n    # TODO Create dynamic stream generator yielding dictionaries using 'yield'\n    pass`;
    benchmarkCode = `def stream_${slug}_items_day${day}(items_iterator):\n    for item in items_iterator:\n        if "ERROR" in item:\n            yield {\n                "topic": "${subtopic}",\n                "message": item.replace("ERROR", "").strip()\n            }`;
    explanation = `The 'yield' statement is used to implement a generator, ensuring '${subtopic}' arrays stream lazily.`;
  }
  // Challenge 3 (Index 7) must use time or perf_counter, and wrapper or decorator
  else if (cIndex === 3) {
    questionText = `High-Precision Performance Profiler (Day ${day} Challenge)`;
    testCasePrompt = `Create a function execution timer decorator 'timer_${slug}_day${day}(func)' to profile '${subtopic}' computations. Utilize 'time.perf_counter()' inside an inner function 'wrapper(*args, **kwargs)' definition to calculate elapsed duration, returning the original function output.`;
    initialCode = `import time\n\ndef timer_${slug}_day${day}(func):\n    def wrapper(*args, **kwargs):\n        # TODO Calculate elapsed duration inside wrapper using time.perf_counter()\n        pass\n    return wrapper`;
    benchmarkCode = `import time\n\ndef timer_${slug}_day${day}(func):\n    def wrapper(*args, **kwargs):\n        start_time = time.perf_counter()\n        val = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start_time\n        print(f"Elapsed duration inside '${subtopic}' is {elapsed:.6f}s")\n        return val\n    return wrapper`;
    explanation = `Designing outer decorator wrappers using 'time.perf_counter()' offers diagnostic tracking of duration bounds inside '${subtopic}'.`;
  }
  // Challenge 4 (Index 8) must use __enter__ and __exit__
  else if (cIndex === 4) {
    questionText = `Resilient Environment Context Guard (Day ${day} Challenge)`;
    testCasePrompt = `Build a custom class-based context manager 'ContextGuard_${slug}_day${day}(resource_id, mode)' designed to secure resources in '${subtopic}'. Implement '__enter__' and '__exit__' magic methods to safeguard setup/teardown execution phases.`;
    initialCode = `class ContextGuard_${slug}_day${day}:\n    def __init__(self, resource_id, mode):\n        self.resource_id = resource_id\n        self.mode = mode\n        self.handle = None\n\n    # TODO Implement magic methods '__enter__' and '__exit__'\n`;
    benchmarkCode = `class ContextGuard_${slug}_day${day}:\n    def __init__(self, resource_id, mode):\n        self.resource_id = resource_id\n        self.mode = mode\n        self.handle = None\n\n    def __enter__(self):\n        self.handle = f"${slug}_active"\n        return self.handle\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.handle = "closed"\n        return False`;
    explanation = `Custom context guards safely structure resources setup and cleanup states for '${subtopic}' via '__enter__' and '__exit__'.`;
  }
  // Challenge 5 (Index 9) must use lock, and with or acquire/release
  else {
    questionText = `Thread-Safe Mutex Lock Monitor (Day ${day} Challenge)`;
    testCasePrompt = `Write a thread-safe update aggregator function 'safe_${slug}_update_day${day}(state_dict, key, offset, lock)' to eliminate race hazards in '${subtopic}' state adjustments. Use a thread lock wrapper using 'with lock:' or acquire/release blocks around state changes.`;
    initialCode = `from threading import Lock\n\ndef safe_${slug}_update_day${day}(state_dict, key, offset, lock):\n    # TODO Execute thread-safe dictionary updates under lock\n    pass`;
    benchmarkCode = `from threading import Lock\n\ndef safe_${slug}_update_day${day}(state_dict, key, offset, lock):\n    with lock:\n        if key in state_dict:\n            state_dict[key] += offset\n        else:\n            state_dict[key] = offset`;
    explanation = `Using threading Lock ensures that simultaneous threads update index states sequentially during '${subtopic}' execution.`;
  }

  return {
    question: questionText,
    testCasePrompt,
    initialCode,
    benchmarkCode,
    explanation
  };
}

// Generate unique questions for Day 1 to 30 (5 MCQs per day, no coding)
export function getQuestionsForDay(day: number): Question[] {
  const category = getCategoryForDay(day);
  const subtopic = getSubTopicForDay(day);
  const questions: Question[] = [];

  // Generate 5 unique Multiple-Choice Questions
  for (let qIndex = 1; qIndex <= 5; qIndex++) {
    const mcqObj = getSpecificMCQ(day, qIndex, subtopic);

    questions.push({
      id: `q-${day}-${qIndex}`,
      question: `[Day ${day} MCQ ${qIndex}] ${mcqObj.question}`,
      options: mcqObj.options,
      correctAnswerIndex: mcqObj.correctAnswerIndex,
      explanation: mcqObj.explanation,
      category,
      type: 'multiple'
    });
  }

  return questions;
}
