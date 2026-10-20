<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminResources;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Generic CRUD for every resource declared in AdminResources. */
class ResourceController extends Controller
{
    public function index(Request $request, string $resource): Response
    {
        $def = AdminResources::get($resource);
        $query = $def['model']::query()->with($def['with'] ?? []);

        if (($q = $request->string('q')->trim()->value()) && ! empty($def['search'])) {
            $query->where(function ($w) use ($def, $q) {
                foreach ($def['search'] as $col) {
                    $w->orWhere($col, 'like', "%{$q}%");
                }
            });
        }

        $filterOptions = null;
        if ($filter = $def['filter'] ?? null) {
            if ($request->filled('filter')) {
                $query->where($filter['field'], $request->input('filter'));
            }
            $filterOptions = $filter['model']::orderBy('name')->pluck('name', 'id');
        }

        [$col, $dir] = $def['order'];
        $paginator = $query->orderBy($col, $dir)->orderByDesc('id')->paginate(25)->withQueryString();

        $paginator->getCollection()->transform(fn (Model $m) => [
            'id' => $m->id,
            'title' => $m->{$def['title']},
            'image' => isset($def['image']) ? $m->{$def['image']} : null,
            'cells' => collect($def['columns'])->map(fn ($c) => data_get($m, $c['name']))->all(),
            'view' => isset($def['view']) ? $this->viewUrl($def['view'], $m) : null,
        ]);

        return Inertia::render('Admin/Resource/Index', [
            'resource' => $this->meta($def),
            'rows' => $paginator,
            'filters' => $request->only('q', 'filter'),
            'filterOptions' => $filterOptions,
        ]);
    }

    public function create(string $resource): Response
    {
        $def = AdminResources::get($resource);
        $record = [];
        foreach (AdminResources::fields($def) as $field) {
            $record[$field['name']] = $field['default'] ?? match ($field['type']) {
                'toggle' => false,
                'list', 'gallery', 'repeater', 'multirelation' => [],
                default => '',
            };
        }

        return $this->form($def, $record);
    }

    public function store(Request $request, string $resource)
    {
        $def = AdminResources::get($resource);
        $model = new $def['model'];
        $this->save($request, $def, $model);

        return redirect()->route('admin.resource.edit', [$resource, $model->id])->with('success', "{$def['singular']} created.");
    }

    public function edit(string $resource, int $id): Response
    {
        $def = AdminResources::get($resource);
        $model = $def['model']::findOrFail($id);
        $record = ['id' => $model->id];
        foreach (AdminResources::fields($def) as $field) {
            $name = $field['name'];
            $record[$name] = match ($field['type']) {
                'multirelation' => $model->{$name}()->pluck($model->{$name}()->getRelated()->getTable().'.id')->all(),
                'date' => optional($model->{$name})->format('Y-m-d'),
                default => $model->{$name},
            };
        }

        return $this->form($def, $record);
    }

    public function update(Request $request, string $resource, int $id)
    {
        $def = AdminResources::get($resource);
        $this->save($request, $def, $def['model']::findOrFail($id));

        return back()->with('success', 'Changes saved.');
    }

    public function duplicate(string $resource, int $id)
    {
        $def = AdminResources::get($resource);
        $original = $def['model']::findOrFail($id);
        $copy = $original->replicate();
        $titleField = $def['title'];
        $copy->{$titleField} = $original->{$titleField}.' (copy)';
        if (isset($copy->slug)) {
            $copy->slug = $this->uniqueSlug($def['model'], Str::slug($copy->{$titleField}));
        }
        $copy->save();

        foreach (AdminResources::fields($def) as $field) {
            if ($field['type'] === 'multirelation') {
                $copy->{$field['name']}()->sync($original->{$field['name']}()->pluck($original->{$field['name']}()->getRelated()->getTable().'.id'));
            }
        }

        return redirect()->route('admin.resource.edit', [$resource, $copy->id])->with('success', 'Duplicated — you are now editing the copy.');
    }

    public function destroy(string $resource, int $id)
    {
        $def = AdminResources::get($resource);
        $def['model']::findOrFail($id)->delete();

        return redirect()->route('admin.resource.index', $resource)->with('success', "{$def['singular']} deleted.");
    }

    private function form(array $def, array $record): Response
    {
        $tabs = [];
        foreach ($def['tabs'] as $tab => $fields) {
            $tabs[] = ['label' => $tab, 'fields' => array_map(fn ($f) => $this->clientField($f), $fields)];
        }

        return Inertia::render('Admin/Resource/Form', [
            'resource' => $this->meta($def),
            'tabs' => $tabs,
            'record' => $record,
            'viewUrl' => isset($record['id'], $def['view']) ? $this->viewUrl($def['view'], (object) $record) : null,
        ]);
    }

    private function clientField(array $field): array
    {
        if (in_array($field['type'], ['relation', 'multirelation'])) {
            $field['options'] = $field['model']::orderBy($field['display'])->pluck($field['display'], 'id');
            unset($field['model']);
        }

        return $field;
    }

    private function save(Request $request, array $def, Model $model): void
    {
        $fields = AdminResources::fields($def);

        $rules = [];
        foreach ($fields as $field) {
            if (! empty($field['required'])) {
                $rules[$field['name']] = 'required';
            }
        }
        $request->validate($rules);

        $sync = [];
        foreach ($fields as $field) {
            $name = $field['name'];
            $value = $request->input($name);

            switch ($field['type']) {
                case 'multirelation':
                    $sync[$name] = array_map('intval', (array) $value);
                    continue 2;
                case 'toggle':
                    $value = (bool) $value;
                    break;
                case 'number':
                    $value = ($value === null || $value === '') ? ($name === 'price_from' ? null : 0) : $value;
                    break;
                case 'relation':
                    $value = $value ?: null;
                    break;
                case 'list':
                case 'gallery':
                    $value = array_values(array_filter((array) $value, fn ($v) => trim((string) $v) !== ''));
                    break;
                case 'repeater':
                    $value = array_values(array_filter((array) $value, fn ($row) => is_array($row) && array_filter($row)));
                    break;
                default:
                    $value = $value === '' ? null : $value;
            }
            $model->{$name} = $value;
        }

        if (in_array('slug', array_column($fields, 'name'))) {
            $base = Str::slug($model->slug ?: $model->{$def['title']});
            $model->slug = $this->uniqueSlug($def['model'], $base, $model->id);
        }

        $model->save();

        foreach ($sync as $relation => $ids) {
            $model->{$relation}()->sync($ids);
        }
    }

    private function uniqueSlug(string $class, string $base, ?int $ignoreId = null): string
    {
        $slug = $base ?: Str::random(6);
        $i = 2;
        while ($class::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function meta(array $def): array
    {
        return [
            'key' => $def['key'],
            'label' => $def['label'],
            'singular' => $def['singular'],
            'columns' => $def['columns'],
            'searchable' => ! empty($def['search']),
            'filterLabel' => $def['filter']['label'] ?? null,
            'hasImage' => isset($def['image']),
        ];
    }

    private function viewUrl(string $pattern, object $m): string
    {
        return str_replace('{slug}', (string) ($m->slug ?? ''), $pattern);
    }
}
