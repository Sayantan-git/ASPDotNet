import type { Chapter } from '../types'

export const csharp: Chapter = {
  id: 'csharp',
  title: 'The C# essentials',
  description: 'Learn to express data, decisions, and reusable behavior.',
  level: 'Beginner',
  accent: 'cyan',
  lessons: [
    {
      id: 'types-and-variables',
      title: 'Types, variables & everyday data',
      subtitle: 'Give each value a type that matches what it means.',
      minutes: 20,
      tags: [
        'int',
        'decimal',
        'double',
        'bool',
        'var',
        'const',
        'readonly',
        'enum',
        'DateTimeOffset',
      ],
      outcomes: [
        'Choose types based on their semantics.',
        'Distinguish inference from dynamic typing.',
        'Recognize numeric conversion and overflow risks.',
      ],
      sections: [
        {
          title: 'A type is a promise',
          body: 'A type tells the compiler what values and operations are allowed. Use `int` for ordinary counts, `bool` for true/false state, `string` for text, and a suitable identifier type for identity. Do not use a string for everything just because incoming HTTP data starts as text. Parsing at a boundary converts external representations into useful internal types.\n\nFor TaskFlow, a title is text, a completion flag is Boolean, and an estimate might be a TimeSpan. An enum defines named alternatives such as Todo, InProgress, and Done. Enums improve readability, but a numeric cast can still produce an undefined enum value; validate external input.',
        },
        {
          title: 'Numbers have different tradeoffs',
          body: '| Type | Typical purpose | Caveat |\n| --- | --- | --- |\n| `int` / `long` | Whole-number counts and IDs | Fixed range; overflow is possible |\n| `double` | Scientific measurements | Binary floating point cannot exactly represent many decimal fractions |\n| `decimal` | Decimal amounts such as money | Finite range and precision; still needs rounding rules |\n| `DateTimeOffset` | A timestamp with a UTC offset | An offset is not a time-zone rule set |\n| `TimeSpan` | A duration | Not a date or a calendar period |\n\nFor money, choose decimal and define currency and rounding policies. Decimal does not automatically solve exchange rates or tax law. For arithmetic where overflow must not wrap, use a checked context and handle the resulting exception deliberately.',
        },
        {
          title: 'Inference, conversion, and constants',
          body: '`var count = 3` is statically inferred as int. `dynamic` defers member binding to runtime and should be reserved for real interoperability needs. An implicit conversion is allowed when the language can make it under its rules; an explicit cast communicates that you accept a conversion that may lose information or fail. Use TryParse for expected bad user input, not exception-driven parsing loops.\n\n`const` is a compile-time constant and is implicitly static. A readonly field can be assigned at declaration or in its owning constructor. Readonly prevents reassigning that field; it does not make a referenced List immutable. Public constants are embedded into consuming assemblies, which can surprise you when libraries are upgraded independently.',
        },
      ],
      diagram: {
        title: 'Choose a type by meaning',
        source:
          'flowchart LR\n  data["Incoming task data"] --> parse["Parse and validate"]\n  parse --> count["int: count"]\n  parse --> title["string: title"]\n  parse --> price["decimal: amount"]\n  parse --> state["bool: complete"]',
        caption:
          'Convert external data at the boundary instead of carrying unvalidated strings through the application.',
      },
      example: {
        title: 'Estimate a task cost',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example for TaskFlow.Cli. Run it with the .NET 10 SDK.',
        code: 'using System.Globalization;\n\nvar estimatedHours = 3;\ndecimal hourlyRate = 19.95m;\ndecimal total = estimatedHours * hourlyRate;\n\nConsole.WriteLine(estimatedHours.GetType().Name);\nConsole.WriteLine(total.ToString("F2", CultureInfo.InvariantCulture));\nConsole.WriteLine(int.TryParse("three", out int parsedHours));\nConsole.WriteLine(parsedHours);',
        output: 'Int32\n59.85\nFalse\n0',
        explanation: [
          'The m suffix makes 19.95 a decimal literal. Without it, that literal is a double.',
          'var does not remove the type: GetType reports Int32 for estimatedHours.',
          'TryParse reports failure through its Boolean return value. Its output value alone is not a success signal.',
        ],
      },
      traps: [
        {
          question: 'Does readonly make an object immutable?',
          answer:
            'It prevents assignment to the field outside its permitted initialization locations. If the field references a mutable collection, its contents can still change.',
          warning: 'Distinguish a stable reference from immutable state.',
        },
        {
          question: 'Why not use double for every money value?',
          answer:
            'Binary floating-point representation introduces surprises for base-10 fractions. Decimal is usually a better fit for financial amounts, together with explicit precision and rounding rules.',
          warning:
            'Decimal is not infinitely precise and does not eliminate domain-specific rounding.',
        },
      ],
      exercise: {
        title: 'Model a useful estimate',
        brief: 'Add estimated hours, an hourly rate, and a deadline to a task.',
        steps: [
          'Choose types and explain each choice.',
          'Reject invalid numeric input using TryParse.',
          'Choose how to represent a deadline that must identify a precise instant.',
        ],
        solution:
          'Use a validated numeric duration or TimeSpan, decimal for a rate with its currency, and DateTimeOffset for an instant. If the requirement is a local recurring wall-clock time, also keep the time-zone identifier; an offset alone does not encode daylight-saving rules.',
      },
      quiz: {
        question: 'What is the compile-time type of var count = 10;?',
        options: ['dynamic', 'object', 'int', 'It has no type'],
        answer: 2,
        explanation:
          'The compiler infers int from the integer literal. A later assignment of a string is a compiler error, even though the declaration used var.',
      },
      references: [
        {
          label: 'C# type system',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/',
        },
      ],
    },
    {
      id: 'control-flow',
      title: 'Decisions, loops & pattern matching',
      subtitle: 'Make the program follow your business rules, not just a straight line.',
      minutes: 22,
      tags: ['if', 'switch', 'pattern matching', 'for', 'foreach', 'while', 'break', 'continue'],
      outcomes: [
        'Choose clear branching and iteration constructs.',
        'Use switch expressions and guard clauses.',
        'Avoid boundary and Boolean logic mistakes.',
      ],
      sections: [
        {
          title: 'Express a decision explicitly',
          body: 'An if statement runs a block only when its Boolean condition is true. An else handles the alternative. Prefer a condition that expresses the rule clearly: `if (remainingCapacity <= 0)` is easier to review than several negations. A **guard clause** exits early for an invalid case, keeping the normal path less indented.\n\n`&&` and `||` short-circuit: the right side is evaluated only if needed. This matters when it accesses something that may be null or performs work. Boolean `&` and `|` evaluate both sides. Do not replace them mechanically. Conditions can contain side effects, but doing so often makes business rules harder to understand.',
        },
        {
          title: 'Select the right loop',
          body: '| Construct | Use it when | Common mistake |\n| --- | --- | --- |\n| `foreach` | You need each item in a sequence | Structurally modifying the same List during enumeration |\n| `for` | You need an index or controlled step | Using `<= Count` rather than `< Count` |\n| `while` | Repetition depends on a condition | Never changing the condition |\n| `do / while` | The body must run at least once | Forgetting the first execution is unconditional |\n\nBreak exits the nearest loop. Continue skips to its next iteration. Return exits the method. They are not interchangeable. When removal is required, collect items to remove, use a suitable collection API such as RemoveAll, or iterate deliberately with a safe strategy.',
        },
        {
          title: 'Patterns make cases readable',
          body: 'A switch expression selects a value. Relational patterns such as `< 0` and logical patterns such as `>= 0 and <= 3` describe sets of values. A discard pattern `_` handles anything not matched earlier. Order matters: the first matching arm wins. The compiler catches some unreachable patterns, but it cannot know your intended business policy.\n\nFor TaskFlow, priority can depend on hours remaining. Test exact boundaries: negative, zero, the threshold itself, and one beyond the threshold. A handful of boundary tests is usually more useful than dozens of random examples. Later, property patterns let you match parts of structured objects without long chains of null checks and conditions.',
        },
      ],
      diagram: {
        title: 'A priority decision',
        source:
          'flowchart LR\n  hours["Hours remaining"] --> overdue{"Below zero?"}\n  overdue -->|Yes| urgent["Overdue"]\n  overdue -->|No| today{"At most 24?"}\n  today -->|Yes| high["High"]\n  today -->|No| normal["Normal"]',
        caption:
          'Boundary values define the rule: zero belongs to High, while negative values are Overdue.',
      },
      example: {
        title: 'Classify approaching deadlines',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example. Replace TaskFlow.Cli/Program.cs and run the project.',
        code: 'int[] deadlines = [-1, 0, 24, 25];\n\nforeach (int hoursRemaining in deadlines)\n{\n    string priority = hoursRemaining switch\n    {\n        < 0 => "Overdue",\n        <= 24 => "High",\n        _ => "Normal"\n    };\n    Console.WriteLine($"{hoursRemaining}: {priority}");\n}',
        output: '-1: Overdue\n0: High\n24: High\n25: Normal',
        explanation: [
          'The collection expression creates an int array because the target type supplies the element type.',
          'The second arm also matches negative numbers mathematically, but those values were already handled by the first arm.',
          'Testing -1, 0, 24, and 25 makes the boundaries visible instead of only checking a typical middle value.',
        ],
      },
      traps: [
        {
          question: 'Are & and && equivalent for Boolean expressions?',
          answer:
            'They have the same basic truth table, but && short-circuits and & evaluates both operands. Side effects, exceptions, and unnecessary work can make their behavior observably different.',
          warning:
            'A null guard on the left is not protective if the right operand is always evaluated.',
        },
        {
          question: 'Can you remove items from a List inside foreach?',
          answer:
            'Structural changes generally invalidate List enumeration. Use RemoveAll, a separate removal list, or an appropriate index-based strategy instead.',
          warning:
            'Changing properties of referenced elements is different from changing the collection structure.',
        },
      ],
      exercise: {
        title: 'Write the edge cases first',
        brief: 'Classify task estimates as invalid, small, medium, or large.',
        steps: [
          'Use invalid below zero, small up to 2, medium up to 8, and large above 8.',
          'Predict results for -1, 0, 2, 3, 8, and 9.',
          'Implement one switch expression and compare every prediction.',
        ],
        solution:
          'Use arms < 0, <= 2, <= 8, and _. Keep that order. The expected categories are invalid, small, small, medium, medium, and large. If zero-hour work is forbidden, change the rule and its tests explicitly instead of relying on a hidden assumption.',
      },
      quiz: {
        question: 'Which construct exits the current method immediately?',
        options: ['continue', 'break', 'return', 'else'],
        answer: 2,
        explanation:
          'Return ends the method, optionally providing its result. Break exits a loop or switch statement; continue begins the next loop iteration.',
      },
      references: [
        {
          label: 'Selection statements',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements',
        },
      ],
    },
    {
      id: 'methods-and-parameters',
      title: 'Methods & parameter passing',
      subtitle:
        'Package a rule once, give it a clear contract, and understand what a call can change.',
      minutes: 24,
      tags: [
        'methods',
        'parameters',
        'ref',
        'out',
        'in',
        'overload',
        'extension methods',
        'tuples',
      ],
      outcomes: [
        'Design small methods with clear inputs and results.',
        'Explain value and reference parameter passing.',
        'Distinguish overloading from overriding.',
      ],
      sections: [
        {
          title: 'A method is a contract',
          body: 'A method has a name, parameters, a return type, and a body. Parameters are the names in the declaration; arguments are the values supplied by the caller. `void` means no result is returned. A method can still have side effects, such as writing a file, so no returned value does not mean no observable behavior.\n\nPrefer methods that do one coherent job. A CalculateProgress method is easier to test if it accepts numbers and returns a number, instead of reading the console and writing a database too. Specify what happens for invalid input: reject it, return a structured failure, or enforce an invariant before the call.',
        },
        {
          title: 'What gets copied?',
          body: "By default, C# passes arguments **by value**. For a value type, it copies the value. For a reference type, it copies the reference to the object. The called method can mutate that shared object, but reassigning its local parameter does not reassign the caller's variable.\n\n| Modifier | Caller contract | Typical use |\n| --- | --- | --- |\n| none | A copy is passed | Most ordinary methods |\n| `ref` | The caller initializes a variable; the method may replace its value | Deliberate shared variable access |\n| `out` | The method must assign before returning normally | TryParse-style results |\n| `in` | Readonly reference to an argument | Carefully measured value-type scenarios |\n\nIn is not a deep immutability guarantee for an object graph. Avoid ref-based APIs when a returned value or small result record is easier to understand.",
        },
        {
          title: 'Names, overloads, and helpers',
          body: '**Overloading** defines methods with the same name but different parameter signatures. A return type alone cannot distinguish overloads. **Overriding** replaces inherited virtual behavior in a derived type; that belongs to object-oriented dispatch, not parameter selection.\n\nOptional and named arguments can improve readability, but changing public parameter names may break source callers that use named arguments. Extension methods are static methods called with instance-like syntax. They do not grant access to private members or truly modify the original type. Tuples can return a few related values, but a named result type is often clearer for an important public contract.',
        },
      ],
      diagram: {
        title: 'Pass a copy of a reference',
        source:
          'flowchart TB\n  caller["Caller variable"] --> object["Shared List object"]\n  parameter["Copied parameter reference"] --> object\n  parameter -. "local reassignment" .-> other["Different List object"]',
        caption:
          'Changing an object through a copied reference can affect the caller. Reassigning the copied reference does not.',
      },
      example: {
        title: 'Observe mutation and reassignment',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example. Predict the output before running it.',
        code: 'var titles = new List<string> { "Learn C#" };\nUpdate(titles);\nConsole.WriteLine(string.Join(", ", titles));\n\nstatic void Update(List<string> items)\n{\n    items.Add("Build an API");\n    items = new List<string> { "Replacement" };\n    Console.WriteLine(items[0]);\n}',
        output: 'Replacement\nLearn C#, Build an API',
        explanation: [
          'The parameter starts as a copy of the caller reference. Add modifies the shared List.',
          'Assigning a different List to items changes only the method-local parameter.',
          'A ref parameter would permit replacing the caller variable, but it is unnecessary for ordinary collection mutation.',
        ],
      },
      traps: [
        {
          question: 'Are reference types passed by reference automatically?',
          answer:
            'No. By default the reference value is copied. Both copies initially point to the same object, which explains shared mutation without by-reference parameter passing.',
          warning: 'An interview answer must separate reference type from ref parameter.',
        },
        {
          question: 'Can two overloads differ only by return type?',
          answer:
            'No. Method overload resolution cannot distinguish methods solely by their return types. Change the parameters or use a distinct descriptive name.',
          warning: 'Overloading is not runtime polymorphic overriding.',
        },
      ],
      exercise: {
        title: 'Extract a pure progress rule',
        brief:
          'Write a method that accepts completed and total task counts and returns a percentage.',
        steps: [
          'Handle total zero explicitly.',
          'Reject negative counts and completed greater than total.',
          'Return a value instead of printing inside the calculation method.',
        ],
        solution:
          'A useful contract returns 0 for an empty list and throws ArgumentOutOfRangeException for impossible counts. Calculate using floating-point or decimal division before multiplying by 100. Keep console output outside the method so tests can compare a simple result.',
      },
      quiz: {
        question:
          'A method reassigns an ordinary List parameter to a new List. What happens to the caller variable?',
        options: [
          'It points to the new List',
          'It becomes null',
          'It remains unchanged',
          'The code cannot compile',
        ],
        answer: 2,
        explanation:
          'The method received a copy of the reference. Reassignment changes that local copy. Mutating the original object would be observable, but replacing the parameter is different.',
      },
      references: [
        {
          label: 'Method parameters',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters',
        },
      ],
    },
    {
      id: 'strings-and-nullability',
      title: 'Strings, null & safe boundaries',
      subtitle: 'Treat missing data as a real state, not a surprise exception.',
      minutes: 22,
      tags: ['string', 'null', 'nullable', 'StringBuilder', 'TryParse', 'culture', 'Unicode'],
      outcomes: [
        'Use nullable reference analysis honestly.',
        'Compare and build strings deliberately.',
        'Validate external input without hiding errors.',
      ],
      sections: [
        {
          title: 'Missing is not the same as empty',
          body: 'Null means there is no referenced object. An empty string is a real string with zero characters. Whitespace is text containing spaces or similar characters. These states may mean different things in your domain. TaskFlow can reject all three for a required title, while an optional description might distinguish missing from intentionally cleared.\n\nWith nullable analysis enabled, `string` communicates an intended non-null reference and `string?` allows null. This is compiler analysis and annotations, not a runtime force field. JSON, reflection, older libraries, and incorrect code can still violate your assumptions. Validate at application boundaries and keep invariants inside your domain.',
        },
        {
          title: 'Use null operators for meaning',
          body: '`?.` accesses a member only when the receiver is not null. `??` supplies a fallback for null. `??=` assigns a fallback when the left side is null. The null-forgiving operator `!` suppresses compiler warnings; it does not check or change the value at runtime.\n\nFor nullable value types, `int?` is shorthand for Nullable<int>. It adds a missing-value state to int. Accessing Value when no value exists throws. Pattern matching, GetValueOrDefault, and explicit branches are often clearer. Do not blindly replace missing values with zero if zero has a separate business meaning, such as an actual zero-hour estimate.',
        },
        {
          title: 'Strings have content and comparison rules',
          body: 'Strings are immutable: operations such as Trim and Replace return strings rather than changing the original. A variable holding a string can still be reassigned. Use StringBuilder for repeated dynamic concatenation when it improves the workload; ordinary interpolation is clearer for a short message.\n\nFor non-linguistic identifiers, choose an ordinal comparison such as StringComparison.OrdinalIgnoreCase when appropriate. Human language sorting and matching may require culture-sensitive behavior. Avoid ad hoc lowercasing as a universal comparison strategy. Also, `string.Length` counts UTF-16 code units, not necessarily user-perceived characters. Emoji and combining marks make this distinction visible in input limits and truncation.',
        },
      ],
      diagram: {
        title: 'Validate before storing',
        source:
          'flowchart LR\n  input["Nullable input"] --> guard{"Missing or whitespace?"}\n  guard -->|Yes| error["Validation error"]\n  guard -->|No| trim["Trim / normalize"]\n  trim --> domain["Valid task title"]',
        caption:
          'A compiler annotation helps inside your code. Boundary validation protects against real external input.',
      },
      example: {
        title: 'Normalize a task title',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example with nullable reference types enabled.',
        code: 'string? rawTitle = "  Learn null safety  ";\n\nif (string.IsNullOrWhiteSpace(rawTitle))\n{\n    Console.WriteLine("A title is required.");\n    return;\n}\n\nstring title = rawTitle.Trim();\nConsole.WriteLine(title);\nConsole.WriteLine(rawTitle.Length > title.Length);\nConsole.WriteLine("DONE".Equals("done", StringComparison.OrdinalIgnoreCase));',
        output: 'Learn null safety\nTrue\nTrue',
        explanation: [
          'IsNullOrWhiteSpace handles null, empty, and whitespace-only strings in one boundary check.',
          'Trim returns a normalized string; the original rawTitle still includes its spaces.',
          'An explicit ordinal case-insensitive comparison makes the identifier comparison independent of the machine culture.',
        ],
      },
      traps: [
        {
          question: 'Does title! prevent a NullReferenceException?',
          answer:
            'No. The null-forgiving operator only changes compiler null-state analysis. If the runtime value is null and you dereference it, the exception can still occur.',
          warning:
            'Use a guard or a correct data contract instead of silencing a warning without evidence.',
        },
        {
          question: 'Does string.Length count visible characters?',
          answer:
            'It counts UTF-16 code units. A user-perceived character can involve multiple code units or multiple Unicode scalar values. Text processing may need Rune or text-element APIs.',
          warning:
            'Do not cut arbitrary user text by a raw index and assume all Unicode remains intact.',
        },
      ],
      exercise: {
        title: 'Separate optional from required data',
        brief: 'Validate a required title and preserve an optional description.',
        steps: [
          'Reject null, empty, and whitespace-only titles.',
          'Trim a valid title without changing the meaning of its internal spaces.',
          'Decide explicitly whether a null description differs from an empty description.',
        ],
        solution:
          'Guard the title with IsNullOrWhiteSpace, then trim it and apply a length limit. Keep description nullable if absence has meaning. Document any normalization rule; do not silently invent defaults that erase distinctions the application needs.',
      },
      quiz: {
        question: 'What does the null-forgiving operator do at runtime?',
        options: [
          'Creates an empty object',
          'Throws immediately for null',
          'Adds a null check',
          'Nothing; it affects compiler analysis',
        ],
        answer: 3,
        explanation:
          'The operator suppresses nullable analysis warnings for that expression. It neither validates the value nor constructs a replacement, so a later dereference can still fail.',
      },
      references: [
        {
          label: 'Nullable reference types',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references',
        },
        {
          label: 'String comparison guidance',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-strings',
        },
      ],
    },
    {
      id: 'collections-and-generics',
      title: 'Collections & generics',
      subtitle: 'Choose the right container and let types protect what goes inside.',
      minutes: 25,
      tags: [
        'List',
        'Dictionary',
        'HashSet',
        'IEnumerable',
        'generics',
        'constraints',
        'Big O',
        'variance',
      ],
      outcomes: [
        'Choose lists, sets, dictionaries, and queues by access pattern.',
        'Explain generic type safety and constraints.',
        'Distinguish an enumerable contract from stored data.',
      ],
      sections: [
        {
          title: 'Start with how you access data',
          body: '| Collection | Main use | Typical cost |\n| --- | --- | --- |\n| Array | Fixed-length indexed storage | O(1) indexed access |\n| List<T> | Ordered resizable sequence | O(1) indexed access; O(n) search |\n| Dictionary<TKey,TValue> | Lookup by unique key | Average O(1) lookup; hashing matters |\n| HashSet<T> | Unique membership | Average O(1) membership check |\n| Queue<T> | First-in, first-out work | Efficient enqueue and dequeue |\n| Stack<T> | Last-in, first-out work | Efficient push and pop |\n\nBig O describes how work grows with input size, not a stopwatch guarantee. Small collections, allocation, key comparison, and cache behavior also matter. TaskFlow might use a List for ordered display and a Dictionary for looking up tasks by ID.',
        },
        {
          title: 'Generics preserve information',
          body: '`List<string>` is a generic type specialized with string as its type argument. The compiler prevents adding an integer, and callers do not need repeated casts when reading items. Generic methods can reuse an algorithm across types while keeping type information. Constraints such as `where T : IComparable<T>` declare operations that the implementation requires.\n\nAvoid using object as a universal container when generics can express the actual contract. Converting a value type to object or an interface can cause **boxing**, which packages that value into an object representation. Generics often avoid that cost, although exact allocations depend on the operation and runtime optimization.',
        },
        {
          title: 'A view is not a snapshot',
          body: "`IEnumerable<T>` means a sequence can be enumerated. It does not promise a List, repeatable results, cheap Count, or already-loaded data. The sequence may execute work lazily each time it is enumerated. IReadOnlyList prevents mutation through that interface, but does not guarantee the underlying collection cannot change elsewhere.\n\nDictionary keys and HashSet elements rely on equality and hash codes. Changing a key's equality-relevant state after insertion can make lookups fail. Use stable immutable keys. Generic variance is another contract issue: IEnumerable<Derived> can be viewed as IEnumerable<Base> for reference types, but List<Derived> cannot become List<Base>, because that would permit adding the wrong subtype.",
        },
      ],
      diagram: {
        title: 'One task, different access patterns',
        source:
          'flowchart TB\n  requirements["What operation is frequent?"] --> ordered["Ordered items: List"]\n  requirements --> lookup["Lookup by ID: Dictionary"]\n  requirements --> unique["Unique tags: HashSet"]\n  requirements --> work["FIFO work: Queue"]',
        caption:
          'Collection choice follows behavior and workload, not the collection name you remember first.',
      },
      example: {
        title: 'Index tasks and deduplicate tags',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. The collection initializer and generic types are standard C#.',
        code: 'var tasks = new Dictionary<int, string>\n{\n    [1] = "Learn collections",\n    [2] = "Build an API"\n};\n\nvar tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);\ntags.Add("CSharp");\ntags.Add("csharp");\n\nif (tasks.TryGetValue(2, out string? title))\n    Console.WriteLine(title);\n\nConsole.WriteLine($"Unique tags: {tags.Count}");',
        output: 'Build an API\nUnique tags: 1',
        explanation: [
          'TryGetValue combines existence checking and retrieval without treating an absent key as an exception.',
          'The set comparer defines equality, so differently cased tags count as the same member.',
          'A Dictionary is not a substitute for a persistent database. This state disappears when the process ends.',
        ],
      },
      traps: [
        {
          question: 'Does IReadOnlyList mean immutable data?',
          answer:
            'No. It restricts mutation through that reference. Another reference may still change the backing collection, and its element objects may themselves be mutable.',
          warning:
            'Read-only access, an immutable collection, and immutable elements are three separate guarantees.',
        },
        {
          question: 'Can List<Dog> be assigned to List<Animal>?',
          answer:
            'No. If that were allowed, someone could insert another Animal subtype into a List<Dog>. A covariant read-oriented interface such as IEnumerable<Animal> can be used for reference-type elements.',
          warning: 'Generic variance is constrained by how the type parameter is used.',
        },
      ],
      exercise: {
        title: 'Select a container for each job',
        brief: 'TaskFlow needs unique labels, task lookup by ID, and a processing queue.',
        steps: [
          'Choose a collection for each requirement.',
          'Make labels case-insensitive without manually lowercasing every value.',
          'Explain what happens to all three collections on application restart.',
        ],
        solution:
          'Use HashSet<string> with an explicit comparer, Dictionary<int, TaskItem> for lookup, and Queue<TaskItem> for FIFO work. All are in-memory structures. Durable tasks and jobs need persistent storage, and concurrent access requires an explicit concurrency design.',
      },
      quiz: {
        question:
          'Which collection most directly represents a set of unique case-insensitive tags?',
        options: [
          'List<object>',
          'Queue<string>',
          'HashSet<string> with a comparer',
          'An untyped array',
        ],
        answer: 2,
        explanation:
          'A HashSet expresses uniqueness and accepts an equality comparer. The comparer can implement ordinal case-insensitive matching without modifying every input string.',
      },
      references: [
        {
          label: 'Generic collections',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/collections/generic/',
        },
        {
          label: 'Generics',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics',
        },
      ],
    },
  ],
}
